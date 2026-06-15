"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class AuthRepository {
    async findByEmail(email) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('email', mssql_1.default.NVarChar, email.trim().toLowerCase())
            .query(`
        SELECT u.*, (SELECT TOP 1 MaNhom FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS MaNhom
        FROM NguoiDung u
        WHERE LOWER(u.Email) = @email
      `);
        return result.recordset[0] || null;
    }
    async findById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query(`
        SELECT u.MaNguoiDung, u.HoTen, u.Email, u.SoDienThoai, u.Bio,
               u.VaiTro, u.TrangThai, u.NgayTao, u.NgayCapNhat,
               (SELECT TOP 1 MaNhom FROM ThanhVienNhom WHERE MaNguoiDung = u.MaNguoiDung) AS MaNhom
        FROM NguoiDung u
        WHERE u.MaNguoiDung = @id
      `);
        return result.recordset[0] || null;
    }
    async create(data) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('hoTen', mssql_1.default.NVarChar(255), data.hoTen)
            .input('email', mssql_1.default.NVarChar(255), data.email.trim().toLowerCase())
            .input('matKhauHash', mssql_1.default.NVarChar(255), data.matKhauHash)
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
    async updateLastLogin(id) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('UPDATE NguoiDung SET NgayCapNhat = GETDATE() WHERE MaNguoiDung = @id');
    }
}
exports.AuthRepository = AuthRepository;
