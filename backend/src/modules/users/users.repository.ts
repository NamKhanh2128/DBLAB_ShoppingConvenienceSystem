/**
 * users.repository.ts
 * Tầng data access — toàn bộ SQL dùng parameterized query (mssql .input())
 * để tránh SQL Injection. Tên param = tên cột DB (PascalCase).
 */
import { getPool } from '../../config/database';
import sql from 'mssql';
import { NguoiDungRow, SafeUser, UpdateProfileDto } from './user.model';

// Danh sách cột an toàn để SELECT (không bao gồm MatKhauHash)
const SAFE_COLUMNS = `
  MaNguoiDung, HoTen, Email, SoDienThoai, Bio,
  VaiTro, TrangThai, NgayTao, NgayCapNhat
`.trim();

export class UsersRepository {

  // ─── READ ──────────────────────────────────────────────────────────────────

  async findAll(): Promise<SafeUser[]> {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        u.MaNguoiDung, u.HoTen, u.Email, u.SoDienThoai, u.Bio,
        u.VaiTro, u.TrangThai, u.NgayTao, u.NgayCapNhat,
        (SELECT COUNT(*) FROM ThanhVienNhom t WHERE t.MaNguoiDung = u.MaNguoiDung) AS SoNhom
      FROM NguoiDung u
      ORDER BY u.NgayTao DESC
    `);
    return result.recordset;
  }

  async findById(id: number): Promise<SafeUser | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT ${SAFE_COLUMNS} FROM NguoiDung WHERE MaNguoiDung = @id`);
    return result.recordset[0] ?? null;
  }

  async findByIdWithPassword(id: number): Promise<NguoiDungRow | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM NguoiDung WHERE MaNguoiDung = @id');
    return result.recordset[0] ?? null;
  }

  // ─── UPDATE PROFILE (Safe — Parameterized) ─────────────────────────────────
  // Dùng COALESCE để chỉ cập nhật field nào được gửi lên (partial update).
  async updateProfile(id: number, data: UpdateProfileDto): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id',          sql.Int,              id)
      .input('hoTen',       sql.NVarChar(100),    data.hoTen       ?? null)
      .input('email',       sql.NVarChar(100),    data.email       ?? null)
      .input('soDienThoai', sql.NVarChar(20),     data.soDienThoai ?? null)
      .input('bio',         sql.NVarChar(500),    data.bio         ?? null)
      .query(`
        UPDATE NguoiDung SET
          HoTen       = COALESCE(@hoTen,       HoTen),
          Email       = COALESCE(@email,       Email),
          SoDienThoai = COALESCE(@soDienThoai, SoDienThoai),
          Bio         = COALESCE(@bio,         Bio),
          NgayCapNhat = GETDATE()
        WHERE MaNguoiDung = @id
      `);
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int,           id)
      .input('pw', sql.NVarChar(255), hashedPassword)
      .query(`
        UPDATE NguoiDung
        SET MatKhauHash = @pw, NgayCapNhat = GETDATE()
        WHERE MaNguoiDung = @id
      `);
  }

  async updateRole(id: number, role: string): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id',   sql.Int,         id)
      .input('role', sql.NVarChar(50), role)
      .query('UPDATE NguoiDung SET VaiTro = @role WHERE MaNguoiDung = @id');
  }

  async updateStatus(id: number, status: string): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id',     sql.Int,         id)
      .input('status', sql.NVarChar(20), status)
      .query('UPDATE NguoiDung SET TrangThai = @status WHERE MaNguoiDung = @id');
  }

  async deleteUser(id: number): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM NguoiDung WHERE MaNguoiDung = @id');
  }

  // ─── STATS ─────────────────────────────────────────────────────────────────

  async countAll(): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT COUNT(*) AS total FROM NguoiDung');
    return result.recordset[0].total;
  }

  async countByStatus(status: string): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
      .input('status', sql.NVarChar(20), status)
      .query('SELECT COUNT(*) AS total FROM NguoiDung WHERE TrangThai = @status');
    return result.recordset[0].total;
  }
}
