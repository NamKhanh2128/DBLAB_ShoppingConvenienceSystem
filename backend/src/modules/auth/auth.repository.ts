import { getPool } from '../../config/database';
import sql from 'mssql';

export class AuthRepository {
  async findByEmail(email: string) {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM NguoiDung WHERE Email = @email');
    return result.recordset[0] || null;
  }

  async findById(id: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT MaNguoiDung, HoTen, Email, SoDienThoai, Bio,
               VaiTro, TrangThai, NgayTao, NgayCapNhat
        FROM NguoiDung
        WHERE MaNguoiDung = @id
      `);
    return result.recordset[0] || null;
  }

  async create(data: { hoTen: string; email: string; matKhauHash: string }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('hoTen', sql.NVarChar, data.hoTen)
      .input('email', sql.NVarChar, data.email)
      .input('matKhauHash', sql.NVarChar, data.matKhauHash)
      .query(`
        INSERT INTO NguoiDung (HoTen, Email, MatKhauHash, VaiTro, TrangThai)
        OUTPUT INSERTED.MaNguoiDung
        VALUES (@hoTen, @email, @matKhauHash, 'MEMBER', 'ACTIVE')
      `);
    return result.recordset[0].MaNguoiDung;
  }

  async updateLastLogin(id: number) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE NguoiDung SET NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id');
  }
}
