import { getPool } from '../../config/database';
import sql from 'mssql';

// Module-level cache — shared across all AdminRepository instances per process lifetime
let _cachedStats: any = null;
let _cacheExpiry: number = 0;

export class AdminRepository {
  async getDashboardStats() {
    const now = Date.now();
    if (_cachedStats && now < _cacheExpiry) {
      return _cachedStats;
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
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai = 'LOCKED') AS bannedUsers,
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

    _cachedStats = stats;
    _cacheExpiry = now + 5 * 60 * 1000; // Cache 5 phút
    return stats;
  }

  async getAllUsers(limit: number = 500, offset: number = 0) {
    const pool = await getPool();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT u.MaNguoiDung, u.HoTen, u.Email, u.SoDienThoai, u.Bio, u.VaiTro, u.TrangThai,
               u.NgayTao, u.NgayCapNhat, u.IsTwoFactorEnabled,
          (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS SoNhom
        FROM NguoiDung u
        WHERE u.TrangThai != 'DELETED'
        ORDER BY u.NgayTao DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);
    return result.recordset;
  }

  async updateUserStatus(id: number, status: string) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id).input('s', sql.NVarChar, status)
      .query('UPDATE NguoiDung SET TrangThai = @s, NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id');
    
    // Xóa cache stats để đảm bảo hiển thị đúng sau khi đổi trạng thái
    _cachedStats = null;
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
    
    _cachedStats = null;
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

  async getAuditLogs(limit: number = 200, offset: number = 0) {
    const pool = await getPool();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
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
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);
    return result.recordset;
  }

  async resetUserPassword(id: number, hashedPassword: string): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('pw', sql.NVarChar(255), hashedPassword)
      .query(`
        UPDATE NguoiDung
        SET MatKhauHash = @pw, NgayCapNhat = GETDATE(), MatKhauNgayCapNhat = GETUTCDATE()
        WHERE MaNguoiDung = @id AND TrangThai != 'DELETED'
      `);
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
        AND VaiTro = 'MEMBER'  -- Đúng giá trị DB: MEMBER (không phải USER)
        AND MaNguoiDung NOT IN (SELECT DISTINCT MaNguoiDung FROM ThanhVienNhom)
        AND MaNguoiDung NOT IN (SELECT DISTINCT NguoiPhuTrach FROM ChiTietMuaSam WHERE NguoiPhuTrach IS NOT NULL)
    `);
    
    _cachedStats = null;
    return result.rowsAffected[0] || 0;
  }

  // ── SYSTEM REPORTS ──────────────────────────────────────────────

  async getReportsStats() {
    const pool = await getPool();

    // 1. KPIs Query
    const kpisResult = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai != 'DELETED') AS totalUsers,
        (SELECT COUNT(*) FROM NhomGiaDinh) AS totalGroups,
        CAST(ISNULL((SELECT SUM(TongChiPhi) FROM BaoCaoChiTieu WHERE TuanThang LIKE N'Tháng%'), 0) AS DECIMAL(12,2)) AS totalSystemSpend,
        CAST(ISNULL((SELECT SUM(TongLangPhi) FROM BaoCaoChiTieu WHERE TuanThang LIKE N'Tháng%'), 0) AS DECIMAL(12,2)) AS totalSystemWaste
    `);

    // 2. Monthly Trend Query
    const trendResult = await pool.request().query(`
      SELECT 
        TuanThang AS label,
        CAST(SUM(TongChiPhi) AS DECIMAL(12,2)) AS spend,
        CAST(SUM(TongLangPhi) AS DECIMAL(12,2)) AS waste
      FROM BaoCaoChiTieu
      WHERE TuanThang LIKE N'Tháng%'
      GROUP BY TuanThang
      ORDER BY MIN(NgayTao) ASC
    `);

    // 3. Category Spend Distribution Query
    const categoryResult = await pool.request().query(`
      SELECT
        ISNULL(NULLIF(ct.DanhMucHang, ''), N'Khác') AS name,
        CAST(ISNULL(SUM(CASE WHEN ct.DaMua = 1 THEN CAST(ct.GiaThucTe AS DECIMAL(12,2)) ELSE 0 END), 0) AS DECIMAL(12,2)) AS value
      FROM DanhSachMuaSam ds
      INNER JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
      WHERE ct.DaMua = 1
      GROUP BY ISNULL(NULLIF(ct.DanhMucHang, ''), N'Khác')
      ORDER BY value DESC
    `);

    // 4. Activity Query (last 7 days)
    const activityResult = await pool.request().query(`
      SELECT 
        ds.NgayTao,
        COUNT(CASE WHEN ds.TrangThai = 'DANG_TAO' THEN 1 END) AS countNew,
        COUNT(CASE WHEN ds.TrangThai = 'COMPLETED' THEN 1 END) AS countCompleted
      FROM DanhSachMuaSam ds
      WHERE ds.NgayTao >= DATEADD(day, -6, CAST(GETDATE() AS DATE))
      GROUP BY ds.NgayTao
      ORDER BY ds.NgayTao ASC
    `);

    // 5. Top Active Families Leaderboard Query
    const topFamiliesResult = await pool.request().query(`
      SELECT TOP 5
        n.TenNhom AS name,
        (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNhom = n.MaNhom) AS memberCount,
        CAST(ISNULL(SUM(bc.TongChiPhi), 0) AS DECIMAL(12,2)) AS totalSpend,
        (SELECT COUNT(*) FROM DanhSachMuaSam WHERE MaNhom = n.MaNhom AND TrangThai = 'COMPLETED') AS completedLists
      FROM NhomGiaDinh n
      LEFT JOIN BaoCaoChiTieu bc ON n.MaNhom = bc.MaNhom AND bc.TuanThang LIKE N'Tháng%'
      GROUP BY n.MaNhom, n.TenNhom
      ORDER BY totalSpend DESC, completedLists DESC
    `);

    return {
      kpis: kpisResult.recordset[0],
      trend: trendResult.recordset,
      categoryDistribution: categoryResult.recordset,
      activity: activityResult.recordset,
      topFamilies: topFamiliesResult.recordset
    };
  }
}
