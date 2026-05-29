import { getPool } from '../../config/database';
import sql from 'mssql';

export class AdminRepository {
  private cachedStats: any = null;
  private cacheExpiry: number = 0;

  async getDashboardStats() {
    const now = Date.now();
    if (this.cachedStats && now < this.cacheExpiry) {
      return this.cachedStats;
    }

    const pool = await getPool();
    
    // Gộp 6 query đếm rời rạc thành 1 query duy nhất và tối ưu hóa loại bỏ DELETED
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai != 'DELETED') AS totalUsers,
        (SELECT COUNT(*) FROM NhomGiaDinh) AS totalGroups,
        (SELECT COUNT(*) FROM MonAn) AS totalRecipes,
        (SELECT COUNT(*) FROM DanhSachMuaSam) AS totalLists,
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai = 'ACTIVE') AS activeUsers,
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai = 'BANNED') AS bannedUsers,
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai != 'DELETED' AND NgayTao >= DATEADD(day, -1, GETDATE())) AS newUsersLast24h
    `);

    const row = result.recordset[0];
    const stats = {
      totalUsers: row.totalUsers,
      totalGroups: row.totalGroups,
      totalRecipes: row.totalRecipes,
      totalLists: row.totalLists,
      activeUsers: row.activeUsers,
      bannedUsers: row.bannedUsers,
      newUsersLast24h: row.newUsersLast24h,
    };

    this.cachedStats = stats;
    this.cacheExpiry = now + 5 * 60 * 1000; // Cache 5 phút
    return stats;
  }

  async getAllUsers() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT u.MaNguoiDung, u.HoTen, u.Email, u.VaiTro, u.TrangThai, u.NgayTao, u.NgayCapNhat,
        (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS SoNhom
      FROM NguoiDung u 
      WHERE u.TrangThai != 'DELETED'
      ORDER BY u.NgayTao DESC
    `);
    return result.recordset;
  }

  async updateUserStatus(id: number, status: string) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id).input('s', sql.NVarChar, status)
      .query('UPDATE NguoiDung SET TrangThai = @s, NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id');
    
    // Xóa cache stats để đảm bảo hiển thị đúng sau khi đổi trạng thái
    this.cachedStats = null;
  }

  async updateUserRole(id: number, role: string) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id).input('r', sql.NVarChar, role)
      .query('UPDATE NguoiDung SET VaiTro = @r, NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id');
  }

  async deleteUser(id: number) {
    const pool = await getPool();
    // Chuyển sang cơ chế Soft Delete để bảo toàn liên kết khóa ngoại
    await pool.request()
      .input('id', sql.Int, id)
      .query("UPDATE NguoiDung SET TrangThai = 'DELETED', NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id");
    
    this.cachedStats = null;
  }

  // ── AUDIT LOGS ──────────────────────────────────────────────────

  async addAuditLog(adminId: number | null, adminName: string, action: string, type: string, status: string, description: string, ip: string) {
    const pool = await getPool();
    await pool.request()
      .input('adminId', sql.Int, adminId || null)
      .input('adminName', sql.NVarChar, adminName)
      .input('action', sql.NVarChar, action)
      .input('type', sql.NVarChar, type)
      .input('status', sql.NVarChar, status)
      .input('desc', sql.NVarChar, description)
      .input('ip', sql.NVarChar, ip)
      .query(`
        INSERT INTO AuditLogs (MaAdmin, HoTenAdmin, HanhDong, Loai, TrangThai, MoTa, DiaChiIP)
        VALUES (@adminId, @adminName, @action, @type, @status, @desc, @ip)
      `);
  }

  async getAuditLogs() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        MaLog AS id,
        HoTenAdmin AS [user],
        HanhDong AS action,
        Loai AS type,
        TrangThai AS status,
        MoTa AS description,
        DiaChiIP AS ip,
        FORMAT(NgayTao, 'yyyy-MM-dd HH:mm:ss') AS timestamp
      FROM AuditLogs
      ORDER BY NgayTao DESC
    `);
    return result.recordset;
  }

  // ── FAKE ACCOUNTS CLEANUP ───────────────────────────────────────

  async cleanupFakeAccounts() {
    const pool = await getPool();
    // Soft-delete các tài khoản ảo đăng ký trong 24h qua chưa gia nhập nhóm
    const result = await pool.request().query(`
      UPDATE NguoiDung
      SET TrangThai = 'DELETED', NgayCapNhat = GETDATE()
      WHERE NgayTao >= DATEADD(day, -1, GETDATE())
        AND TrangThai != 'DELETED'
        AND VaiTro = 'USER'
        AND MaNguoiDung NOT IN (SELECT DISTINCT MaNguoiDung FROM ThanhVienNhom)
        AND MaNguoiDung NOT IN (SELECT DISTINCT NguoiPhuTrach FROM ChiTietMuaSam WHERE NguoiPhuTrach IS NOT NULL)
    `);
    
    this.cachedStats = null;
    return result.rowsAffected[0] || 0;
  }
}
