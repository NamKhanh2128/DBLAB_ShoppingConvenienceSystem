"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class InventoryRepository {
    async getById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT * FROM KhoThucPham WHERE MaTP = @id');
        return result.recordset[0] ?? null;
    }
    async getByGroup(groupId) {
        const pool = await (0, database_1.getPool)();
        // 1. Tự động đồng bộ hóa các vật phẩm quá hạn thành trạng thái 'HE_HAN'
        await pool.request()
            .query(`
        UPDATE KhoThucPham 
        SET TrangThai = 'HE_HAN', NgayCapNhat = GETDATE()
        WHERE HanSuDung < CAST(GETDATE() AS DATE) AND TrangThai = 'CON_HAN'
      `);
        // 2. Lấy danh sách thực phẩm
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .query('SELECT * FROM KhoThucPham WHERE MaNhom = @g ORDER BY HanSuDung ASC, NgayNhap DESC');
        return result.recordset;
    }
    async getExpiring(groupId, days = 3) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('d', mssql_1.default.Int, days)
            .query(`
        SELECT * FROM KhoThucPham
        WHERE MaNhom = @g AND HanSuDung IS NOT NULL
          AND HanSuDung BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(day, @d, CAST(GETDATE() AS DATE))
          AND SoLuong > 0
        ORDER BY HanSuDung ASC
      `);
        return result.recordset;
    }
    async add(data, creatorId) {
        const pool = await (0, database_1.getPool)();
        const tx = new mssql_1.default.Transaction(pool);
        try {
            await tx.begin();
            const result = await tx.request()
                .input('g', mssql_1.default.Int, data.maNhom)
                .input('ten', mssql_1.default.NVarChar(100), data.tenTP)
                .input('sl', mssql_1.default.Decimal(10, 2), data.soLuong)
                .input('dv', mssql_1.default.NVarChar(50), data.donVi || 'cái')
                .input('hsd', mssql_1.default.Date, data.hanSuDung || null)
                .input('vt', mssql_1.default.NVarChar(100), data.viTri || null)
                .query(`
          INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, Version, NgayCapNhat)
          OUTPUT INSERTED.MaTP
          VALUES (@g, @ten, @sl, @dv, @hsd, @vt, 1, GETDATE())
        `);
            const newId = result.recordset[0].MaTP;
            // Ghi nhật ký kho
            await tx.request()
                .input('tp', mssql_1.default.Int, newId)
                .input('ten', mssql_1.default.NVarChar(100), data.tenTP)
                .input('nhom', mssql_1.default.Int, data.maNhom)
                .input('user', mssql_1.default.Int, creatorId)
                .input('act', mssql_1.default.NVarChar(50), 'THEM_MOI')
                .input('before', mssql_1.default.Decimal(10, 2), 0)
                .input('after', mssql_1.default.Decimal(10, 2), data.soLuong)
                .input('dv', mssql_1.default.NVarChar(50), data.donVi || 'cái')
                .input('note', mssql_1.default.NVarChar(255), data.viTri ? `Cất tại: ${data.viTri}` : 'Thêm mới thực phẩm')
                .query(`
          INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, GhiChu)
          VALUES (@tp, @ten, @nhom, @user, @act, @before, @after, @dv, @note)
        `);
            await tx.commit();
            return newId;
        }
        catch (err) {
            await tx.rollback();
            throw err;
        }
    }
    /**
     * Cập nhật thông tin thực phẩm an toàn sử dụng OCC (Optimistic Concurrency Control)
     */
    async update(id, data, updaterId, existing) {
        const pool = await (0, database_1.getPool)();
        const tx = new mssql_1.default.Transaction(pool);
        try {
            await tx.begin();
            // Cập nhật với kiểm tra chéo Version để tránh Dirty Write
            const result = await tx.request()
                .input('id', mssql_1.default.Int, id)
                .input('sl', mssql_1.default.Decimal(10, 2), data.soLuong)
                .input('tt', mssql_1.default.NVarChar(30), data.trangThai || existing.TrangThai)
                .input('vt', mssql_1.default.NVarChar(100), data.viTri || null)
                .input('v', mssql_1.default.Int, data.version)
                .query(`
          UPDATE KhoThucPham 
          SET SoLuong = @sl, TrangThai = @tt, ViTri = @vt, Version = Version + 1, NgayCapNhat = GETDATE()
          WHERE MaTP = @id AND Version = @v
        `);
            if (result.rowsAffected[0] === 0) {
                await tx.rollback();
                return false; // Thất bại do xung đột OCC
            }
            // Xác định hành động ghi log
            let action = 'CAP_NHAT';
            let note = `Cập nhật thực phẩm.`;
            if (existing.SoLuong !== data.soLuong) {
                if (data.soLuong === 0) {
                    action = 'TIEU_THU';
                    note = `Đã tiêu thụ hết sạch.`;
                }
                else if (data.soLuong < existing.SoLuong) {
                    action = 'TIEU_THU';
                    note = `Đã tiêu thụ bớt (Giảm ${existing.SoLuong - data.soLuong} ${existing.DonVi}).`;
                }
                else {
                    note = `Tăng số lượng (Thêm ${data.soLuong - existing.SoLuong} ${existing.DonVi}).`;
                }
            }
            // Ghi nhật ký kho
            await tx.request()
                .input('tp', mssql_1.default.Int, id)
                .input('ten', mssql_1.default.NVarChar(100), existing.TenTP)
                .input('nhom', mssql_1.default.Int, existing.MaNhom)
                .input('user', mssql_1.default.Int, updaterId)
                .input('act', mssql_1.default.NVarChar(50), action)
                .input('before', mssql_1.default.Decimal(10, 2), existing.SoLuong)
                .input('after', mssql_1.default.Decimal(10, 2), data.soLuong)
                .input('dv', mssql_1.default.NVarChar(50), existing.DonVi)
                .input('note', mssql_1.default.NVarChar(255), note)
                .query(`
          INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, GhiChu)
          VALUES (@tp, @ten, @nhom, @user, @act, @before, @after, @dv, @note)
        `);
            await tx.commit();
            return true;
        }
        catch (err) {
            await tx.rollback();
            throw err;
        }
    }
    async remove(id, deleterId, existing) {
        const pool = await (0, database_1.getPool)();
        const tx = new mssql_1.default.Transaction(pool);
        try {
            await tx.begin();
            // 1. Ghi nhật ký xóa trước khi xóa cứng để lưu vết
            await tx.request()
                .input('tp', mssql_1.default.Int, id)
                .input('ten', mssql_1.default.NVarChar(100), existing.TenTP)
                .input('nhom', mssql_1.default.Int, existing.MaNhom)
                .input('user', mssql_1.default.Int, deleterId)
                .input('act', mssql_1.default.NVarChar(50), 'XOA')
                .input('before', mssql_1.default.Decimal(10, 2), existing.SoLuong)
                .input('after', mssql_1.default.Decimal(10, 2), 0)
                .input('dv', mssql_1.default.NVarChar(50), existing.DonVi)
                .input('note', mssql_1.default.NVarChar(255), `Đã loại bỏ hoàn toàn vật phẩm khỏi kho.`)
                .query(`
          INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, GhiChu)
          VALUES (@tp, @ten, @nhom, @user, @act, @before, @after, @dv, @note)
        `);
            // 2. Thực hiện xóa cứng khỏi KhoThucPham
            await tx.request()
                .input('id', mssql_1.default.Int, id)
                .query('DELETE FROM KhoThucPham WHERE MaTP = @id');
            await tx.commit();
        }
        catch (err) {
            await tx.rollback();
            throw err;
        }
    }
    async getAuditLogs(groupId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .query(`
        SELECT n.*, u.HoTen AS TenNguoiThucHien 
        FROM NhatKyKho n
        LEFT JOIN NguoiDung u ON n.NguoiThucHien = u.MaNguoiDung
        WHERE n.MaNhom = @g
        ORDER BY n.NgayThucHien DESC
      `);
        return result.recordset;
    }
    async countByGroup(groupId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .query('SELECT COUNT(*) AS total FROM KhoThucPham WHERE MaNhom = @g');
        return result.recordset[0].total;
    }
}
exports.InventoryRepository = InventoryRepository;
