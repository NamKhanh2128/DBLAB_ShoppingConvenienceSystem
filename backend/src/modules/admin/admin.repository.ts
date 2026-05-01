import { getPool } from '../../config/database';
import sql from 'mssql';

export class AdminRepository {
  async getDashboardStats() {
    const pool = await getPool();
    const users = await pool.request().query('SELECT COUNT(*) AS total FROM NguoiDung');
    const groups = await pool.request().query('SELECT COUNT(*) AS total FROM NhomGiaDinh');
    const recipes = await pool.request().query('SELECT COUNT(*) AS total FROM MonAn');
    const lists = await pool.request().query('SELECT COUNT(*) AS total FROM DanhSachMuaSam');
    const activeUsers = await pool.request().query("SELECT COUNT(*) AS total FROM NguoiDung WHERE TrangThai = 'ACTIVE'");
    const bannedUsers = await pool.request().query("SELECT COUNT(*) AS total FROM NguoiDung WHERE TrangThai = 'BANNED'");

    return {
      totalUsers: users.recordset[0].total,
      totalGroups: groups.recordset[0].total,
      totalRecipes: recipes.recordset[0].total,
      totalLists: lists.recordset[0].total,
      activeUsers: activeUsers.recordset[0].total,
      bannedUsers: bannedUsers.recordset[0].total,
    };
  }

  async getAllUsers() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT u.MaNguoiDung, u.HoTen, u.Email, u.VaiTro, u.TrangThai, u.NgayTao, u.NgayCapNhat,
        (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS SoNhom
      FROM NguoiDung u ORDER BY u.NgayTao DESC
    `);
    return result.recordset;
  }

  async updateUserStatus(id: number, status: string) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id).input('s', sql.NVarChar, status)
      .query('UPDATE NguoiDung SET TrangThai = @s WHERE MaNguoiDung = @id');
  }

  async updateUserRole(id: number, role: string) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id).input('r', sql.NVarChar, role)
      .query('UPDATE NguoiDung SET VaiTro = @r WHERE MaNguoiDung = @id');
  }

  async deleteUser(id: number) {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM NguoiDung WHERE MaNguoiDung = @id');
  }
}
