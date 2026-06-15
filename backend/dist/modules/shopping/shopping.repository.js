"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingRepository = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class ShoppingRepository {
    // ── DanhSachMuaSam ──────────────────────────────────────────────
    async getListsByGroup(groupId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .query(`
        SELECT ds.*,
          (SELECT COUNT(*) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach) AS TongMon,
          (SELECT COUNT(*) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach AND DaMua = 1) AS DaMuaCount,
          (SELECT ISNULL(SUM(GiaDuKien),0) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach) AS TongGiaDuKien,
          (SELECT ISNULL(SUM(GiaThucTe),0) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach AND DaMua = 1) AS TongGiaThucTe
        FROM DanhSachMuaSam ds
        WHERE ds.MaNhom = @g
        ORDER BY ds.NgayTao DESC
      `);
        return result.recordset;
    }
    /**
     * Lấy thông tin một danh sách theo ID (kèm MaNhom để IDOR check).
     */
    async getListById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT * FROM DanhSachMuaSam WHERE MaDanhSach = @id');
        return result.recordset[0] || null;
    }
    async createList(groupId, ghiChu) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('gc', mssql_1.default.NVarChar, ghiChu || null)
            .query('INSERT INTO DanhSachMuaSam (MaNhom, GhiChu) OUTPUT INSERTED.MaDanhSach VALUES (@g, @gc)');
        return result.recordset[0].MaDanhSach;
    }
    async updateListStatus(id, status) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('s', mssql_1.default.NVarChar, status)
            .query('UPDATE DanhSachMuaSam SET TrangThai = @s WHERE MaDanhSach = @id');
    }
    async deleteList(id) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM DanhSachMuaSam WHERE MaDanhSach = @id');
    }
    // ── ChiTietMuaSam ──────────────────────────────────────────────
    async getItems(listId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, listId)
            .query(`
        SELECT
          ct.*,
          u.HoTen AS TenNguoiPhuTrach,
          um.HoTen AS TenNguoiMua
        FROM ChiTietMuaSam ct
        LEFT JOIN NguoiDung u  ON ct.NguoiPhuTrach = u.MaNguoiDung
        LEFT JOIN NguoiDung um ON ct.MaNguoiMua     = um.MaNguoiDung
        WHERE ct.MaDanhSach = @id
        ORDER BY ct.DaMua ASC, ct.DanhMucHang ASC, ct.TenThucPham ASC
      `);
        return result.recordset;
    }
    /**
     * Lấy thông tin một item (kèm MaDanhSach để IDOR cross-check).
     */
    async getItemById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT * FROM ChiTietMuaSam WHERE MaCT = @id');
        return result.recordset[0] || null;
    }
    /**
     * Tìm item trùng tên + đơn vị trong cùng danh sách (để auto-merge).
     * So sánh tên case-insensitive, loại bỏ khoảng trắng thừa.
     */
    async findDuplicateItem(listId, tenThucPham, donVi) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('listId', mssql_1.default.Int, listId)
            .input('ten', mssql_1.default.NVarChar, tenThucPham.trim())
            .input('dv', mssql_1.default.NVarChar, donVi || null)
            .query(`
        SELECT TOP 1 MaCT, SoLuong
        FROM ChiTietMuaSam
        WHERE MaDanhSach = @listId
          AND LTRIM(RTRIM(LOWER(TenThucPham))) = LTRIM(RTRIM(LOWER(@ten)))
          AND (
            (@dv IS NULL AND (DonVi IS NULL OR DonVi = ''))
            OR LTRIM(RTRIM(LOWER(DonVi))) = LTRIM(RTRIM(LOWER(@dv)))
          )
          AND DaMua = 0  -- Chỉ merge với item chưa mua
      `);
        return result.recordset[0] || null;
    }
    /**
     * Cộng thêm số lượng vào item đã có (dùng khi auto-merge trùng tên).
     */
    async mergeItemQuantity(itemId, addSoLuong) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, itemId)
            .input('sl', mssql_1.default.Decimal(10, 2), addSoLuong)
            .query('UPDATE ChiTietMuaSam SET SoLuong = SoLuong + @sl WHERE MaCT = @id');
    }
    async addItem(listId, data) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('ds', mssql_1.default.Int, listId)
            .input('ten', mssql_1.default.NVarChar, data.tenThucPham)
            .input('sl', mssql_1.default.Decimal(10, 2), data.soLuong)
            .input('dv', mssql_1.default.NVarChar, data.donVi || null)
            .input('npt', mssql_1.default.Int, data.nguoiPhuTrach || null)
            .input('gdk', mssql_1.default.Decimal(12, 2), data.giaDuKien ?? 0)
            .input('gte', mssql_1.default.Decimal(12, 2), data.giaThucTe ?? 0)
            .input('dmh', mssql_1.default.NVarChar, data.danhMucHang || null)
            .query(`
        INSERT INTO ChiTietMuaSam
          (MaDanhSach, TenThucPham, SoLuong, DonVi, NguoiPhuTrach, GiaDuKien, GiaThucTe, DanhMucHang)
        OUTPUT INSERTED.MaCT
        VALUES (@ds, @ten, @sl, @dv, @npt, @gdk, @gte, @dmh)
      `);
        return result.recordset[0].MaCT;
    }
    async toggleItem(id, done, userId) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('done', mssql_1.default.Bit, done ? 1 : 0)
            .input('userId', mssql_1.default.Int, userId || null)
            // Ghi timestamp và ai mua khi đánh dấu đã mua; xóa khi bỏ đánh dấu
            .query(`
        UPDATE ChiTietMuaSam
        SET DaMua = @done,
            NgayMua = CASE WHEN @done = 1 THEN GETDATE() ELSE NULL END,
            MaNguoiMua = CASE WHEN @done = 1 THEN @userId ELSE NULL END
        WHERE MaCT = @id
      `);
    }
    async updateItem(id, data) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('ten', mssql_1.default.NVarChar, data.tenThucPham || null)
            .input('sl', mssql_1.default.Decimal(10, 2), data.soLuong || null)
            .input('dv', mssql_1.default.NVarChar, data.donVi || null)
            .input('gdk', mssql_1.default.Decimal(12, 2), data.giaDuKien ?? null)
            .input('gte', mssql_1.default.Decimal(12, 2), data.giaThucTe ?? null)
            .input('dmh', mssql_1.default.NVarChar, data.danhMucHang || null)
            .query(`
        UPDATE ChiTietMuaSam SET
          TenThucPham = ISNULL(@ten, TenThucPham),
          SoLuong     = ISNULL(@sl, SoLuong),
          DonVi       = ISNULL(@dv, DonVi),
          GiaDuKien   = ISNULL(@gdk, GiaDuKien),
          GiaThucTe   = ISNULL(@gte, GiaThucTe),
          DanhMucHang = ISNULL(@dmh, DanhMucHang)
        WHERE MaCT = @id
      `);
    }
    async deleteItem(id) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM ChiTietMuaSam WHERE MaCT = @id');
    }
    // ── Auto-Restock: Nhập kho sau khi hoàn thành mua sắm ──────────
    /**
     * Lấy danh sách items đã mua (DaMua=1) trong một list.
     * Dùng để nhập vào kho.
     */
    async getPurchasedItems(listId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('listId', mssql_1.default.Int, listId)
            .query(`
        SELECT MaCT, TenThucPham, SoLuong, DonVi, GiaThucTe, DanhMucHang
        FROM ChiTietMuaSam
        WHERE MaDanhSach = @listId AND DaMua = 1
      `);
        return result.recordset;
    }
    /**
     * Nhập một món vào kho của nhóm.
     * Logic: Nếu đã có item cùng tên trong kho (CON_HAN) → cộng số lượng.
     *        Nếu chưa có → INSERT mới.
     *
     * @returns 'added' | 'merged'
     */
    async upsertInventoryItem(groupId, tenTP, soLuong, donVi, addedBy) {
        const pool = await (0, database_1.getPool)();
        // Tìm item cùng tên trong kho (case-insensitive, còn hạn)
        const existing = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('ten', mssql_1.default.NVarChar, tenTP.trim())
            .query(`
        SELECT TOP 1 MaTP, SoLuong
        FROM KhoThucPham
        WHERE MaNhom = @g
          AND LTRIM(RTRIM(LOWER(TenTP))) = LTRIM(RTRIM(LOWER(@ten)))
          AND TrangThai IN ('CON_HAN', 'HET')
        ORDER BY HanSuDung DESC
      `);
        if (existing.recordset.length > 0) {
            // Cộng số lượng vào item đã có + đặt lại trạng thái
            await pool.request()
                .input('maTP', mssql_1.default.Int, existing.recordset[0].MaTP)
                .input('sl', mssql_1.default.Decimal(10, 2), soLuong)
                .query(`
          UPDATE KhoThucPham
          SET SoLuong = SoLuong + @sl,
              TrangThai = 'CON_HAN',
              NgayNhap = CAST(GETDATE() AS DATE)
          WHERE MaTP = @maTP
        `);
            return 'merged';
        }
        else {
            // Tạo mới trong kho
            await pool.request()
                .input('g', mssql_1.default.Int, groupId)
                .input('ten', mssql_1.default.NVarChar, tenTP.trim())
                .input('sl', mssql_1.default.Decimal(10, 2), soLuong)
                .input('dv', mssql_1.default.NVarChar, donVi || null)
                .query(`
          INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, TrangThai, NgayNhap)
          VALUES (@g, @ten, @sl, @dv, 'CON_HAN', CAST(GETDATE() AS DATE))
        `);
            return 'added';
        }
    }
    // ── Merge Duplicates: Gom nhóm nguyên liệu trùng ───────────────
    /**
     * Gom nhóm tất cả items trùng tên+đơn vị trong một danh sách.
     * Logic:
     *   - Với mỗi nhóm (TenThucPham, DonVi): giữ lại item có MaCT nhỏ nhất,
     *     cộng tổng SoLuong, tổng GiaDuKien, xóa các item thừa.
     *
     * @returns số lượng items đã được gom lại
     */
    async mergeAllDuplicates(listId) {
        const pool = await (0, database_1.getPool)();
        // Lấy tất cả items chưa mua, nhóm theo tên+đơn vị
        const grouped = await pool.request()
            .input('listId', mssql_1.default.Int, listId)
            .query(`
        SELECT
          LTRIM(RTRIM(LOWER(TenThucPham))) AS TenNorm,
          LTRIM(RTRIM(LOWER(ISNULL(DonVi,'')))) AS DvNorm,
          MIN(MaCT) AS KeepId,
          SUM(SoLuong) AS TongSoLuong,
          SUM(GiaDuKien) AS TongGiaDuKien,
          COUNT(*) AS SoLuongDong
        FROM ChiTietMuaSam
        WHERE MaDanhSach = @listId AND DaMua = 0
        GROUP BY
          LTRIM(RTRIM(LOWER(TenThucPham))),
          LTRIM(RTRIM(LOWER(ISNULL(DonVi,''))))
        HAVING COUNT(*) > 1
      `);
        let mergedCount = 0;
        for (const group of grouped.recordset) {
            // Cập nhật item giữ lại với tổng số lượng + giá
            await pool.request()
                .input('id', mssql_1.default.Int, group.KeepId)
                .input('sl', mssql_1.default.Decimal(10, 2), group.TongSoLuong)
                .input('gdk', mssql_1.default.Decimal(12, 2), group.TongGiaDuKien)
                .query(`
          UPDATE ChiTietMuaSam
          SET SoLuong = @sl, GiaDuKien = @gdk
          WHERE MaCT = @id
        `);
            // Xóa các items trùng còn lại (không phải KeepId)
            await pool.request()
                .input('listId', mssql_1.default.Int, listId)
                .input('keepId', mssql_1.default.Int, group.KeepId)
                .input('tenNorm', mssql_1.default.NVarChar, group.TenNorm)
                .input('dvNorm', mssql_1.default.NVarChar, group.DvNorm)
                .query(`
          DELETE FROM ChiTietMuaSam
          WHERE MaDanhSach = @listId
            AND MaCT <> @keepId
            AND DaMua = 0
            AND LTRIM(RTRIM(LOWER(TenThucPham))) = @tenNorm
            AND LTRIM(RTRIM(LOWER(ISNULL(DonVi,'')))) = @dvNorm
        `);
            // Đếm số items đã bị gom (SoLuongDong - 1 vì giữ lại 1)
            mergedCount += group.SoLuongDong - 1;
        }
        return mergedCount;
    }
}
exports.ShoppingRepository = ShoppingRepository;
