"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
/**
 * users.repository.ts
 * Tầng data access — toàn bộ SQL dùng parameterized query (mssql .input())
 * để tránh SQL Injection. Tên param = tên cột DB (PascalCase).
 */
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
// Danh sách cột an toàn để SELECT (không bao gồm MatKhauHash)
const SAFE_COLUMNS = `
  MaNguoiDung, HoTen, Email, SoDienThoai, Bio,
  VaiTro, TrangThai, NgayTao, NgayCapNhat
`.trim();
class UsersRepository {
    // ─── READ ──────────────────────────────────────────────────────────────────
    async findAll() {
        const pool = await (0, database_1.getPool)();
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
    async findById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query(`SELECT ${SAFE_COLUMNS} FROM NguoiDung WHERE MaNguoiDung = @id`);
        return result.recordset[0] ?? null;
    }
    async findByIdWithPassword(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT * FROM NguoiDung WHERE MaNguoiDung = @id');
        return result.recordset[0] ?? null;
    }
    // ─── UPDATE PROFILE (Safe — Parameterized) ─────────────────────────────────
    // Dùng COALESCE để chỉ cập nhật field nào được gửi lên (partial update).
    async updateProfile(id, data) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('hoTen', mssql_1.default.NVarChar(100), data.hoTen ?? null)
            .input('email', mssql_1.default.NVarChar(100), data.email ?? null)
            .input('soDienThoai', mssql_1.default.NVarChar(20), data.soDienThoai ?? null)
            .input('bio', mssql_1.default.NVarChar(500), data.bio ?? null)
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
    async updatePassword(id, hashedPassword) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('pw', mssql_1.default.NVarChar(255), hashedPassword)
            .query(`
        UPDATE NguoiDung
        SET MatKhauHash = @pw, NgayCapNhat = GETDATE()
        WHERE MaNguoiDung = @id
      `);
    }
    async updateRole(id, role) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('role', mssql_1.default.NVarChar(50), role)
            .query('UPDATE NguoiDung SET VaiTro = @role WHERE MaNguoiDung = @id');
    }
    async updateStatus(id, status) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('status', mssql_1.default.NVarChar(20), status)
            .query('UPDATE NguoiDung SET TrangThai = @status WHERE MaNguoiDung = @id');
    }
    async deleteUser(id) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM NguoiDung WHERE MaNguoiDung = @id');
    }
    // ─── STATS ─────────────────────────────────────────────────────────────────
    async countAll() {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .query('SELECT COUNT(*) AS total FROM NguoiDung');
        return result.recordset[0].total;
    }
    async countByStatus(status) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('status', mssql_1.default.NVarChar(20), status)
            .query('SELECT COUNT(*) AS total FROM NguoiDung WHERE TrangThai = @status');
        return result.recordset[0].total;
    }
}
exports.UsersRepository = UsersRepository;
