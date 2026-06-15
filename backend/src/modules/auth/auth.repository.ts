import { getPool } from '../../config/database';
import sql from 'mssql';

export class AuthRepository {
  async findByEmail(email: string) {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email.trim().toLowerCase())
      .query(`
        SELECT u.*, (SELECT TOP 1 MaNhom FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS MaNhom
        FROM NguoiDung u
        WHERE LOWER(u.Email) = @email
      `);
    return result.recordset[0] || null;
  }

  async findById(id: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT u.MaNguoiDung, u.HoTen, u.Email, u.SoDienThoai, u.Bio,
               u.VaiTro, u.TrangThai, u.NgayTao, u.NgayCapNhat,
               (SELECT TOP 1 MaNhom FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS MaNhom
        FROM NguoiDung u
        WHERE u.MaNguoiDung = @id
      `);
    return result.recordset[0] || null;
  }

  async create(data: { hoTen: string; email: string; matKhauHash: string }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('hoTen', sql.NVarChar(255), data.hoTen)
      .input('email', sql.NVarChar(255), data.email.trim().toLowerCase())
      .input('matKhauHash', sql.NVarChar(255), data.matKhauHash)
      .query(`
        INSERT INTO NguoiDung (HoTen, Email, MatKhauHash, VaiTro, TrangThai)
        OUTPUT INSERTED.MaNguoiDung, INSERTED.HoTen, INSERTED.Email, INSERTED.SoDienThoai,
               INSERTED.Bio, INSERTED.VaiTro, INSERTED.TrangThai, INSERTED.NgayTao, INSERTED.NgayCapNhat
        VALUES (@hoTen, @email, @matKhauHash, 'MEMBER', 'ACTIVE')
      `);
    const row = result.recordset?.[0];
    if (!row?.MaNguoiDung) {
      throw new Error('Không thể tạo tài khoản. Vui lòng kiểm tra kết nối CSDL.');
    }
    return row;
  }

  async updateLastLogin(id: number) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE NguoiDung SET NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id');
  }
}
