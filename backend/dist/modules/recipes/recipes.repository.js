"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipesRepository = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class RecipesRepository {
    /**
     * Lấy tất cả công thức mà user có quyền xem:
     *   - System recipes (MaNhom IS NULL) — công khai cho mọi người
     *   - Recipes của nhóm gia đình mà user đang là thành viên
     */
    async getAll(groupId) {
        const pool = await (0, database_1.getPool)();
        const req = pool.request();
        let query;
        if (groupId) {
            req.input('groupId', mssql_1.default.Int, groupId);
            // Trả về system recipes + recipes của nhóm người dùng
            query = `
        SELECT *
        FROM MonAn
        WHERE MaNhom IS NULL OR MaNhom = @groupId
        ORDER BY
          CASE WHEN MaNhom IS NULL THEN 1 ELSE 0 END, -- System recipes xuống dưới
          NgayTao DESC
      `;
        }
        else {
            // Chưa có groupId → chỉ trả system recipes
            query = `SELECT * FROM MonAn WHERE MaNhom IS NULL ORDER BY NgayTao DESC`;
        }
        const result = await req.query(query);
        return result.recordset;
    }
    /**
     * Lấy chi tiết một công thức theo ID.
     * Trả về null nếu không tìm thấy.
     */
    async getById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT * FROM MonAn WHERE MaMon = @id');
        return result.recordset[0] || null;
    }
    /**
     * Lấy danh sách nguyên liệu của một công thức.
     * Join với KhoThucPham để biết số lượng hiện có trong kho (nếu có).
     * Lưu ý: NguyenLieuMon.MaTP liên kết với KhoThucPham của một nhóm cụ thể.
     */
    async getIngredients(monId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('id', mssql_1.default.Int, monId)
            .query(`
        SELECT
          nl.MaTP,
          k.TenTP,
          nl.SoLuongCan,
          k.DonVi,
          k.SoLuong AS SoLuongKho,
          k.TrangThai AS TrangThaiKho
        FROM NguyenLieuMon nl
        JOIN KhoThucPham k ON nl.MaTP = k.MaTP
        WHERE nl.MaMon = @id
      `);
        return result.recordset;
    }
    /**
     * Tạo công thức mới.
     * Lưu MaNhom và MaNguoiTao để phân quyền IDOR.
     */
    async create(data, userId, groupId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('ten', mssql_1.default.NVarChar, data.tenMon)
            .input('ct', mssql_1.default.NVarChar, data.congThuc || null)
            .input('hd', mssql_1.default.NVarChar, data.huongDan || null)
            .input('thoiGian', mssql_1.default.Int, data.thoiGian || null)
            .input('khauPhan', mssql_1.default.Int, data.khauPhan || null)
            .input('doKho', mssql_1.default.NVarChar, data.doKho || 'Dễ')
            .input('danhMuc', mssql_1.default.NVarChar, data.danhMuc || 'Khác')
            .input('moTa', mssql_1.default.NVarChar, data.moTa || null)
            .input('hinhAnh', mssql_1.default.NVarChar, data.hinhAnh || null)
            .input('maNhom', mssql_1.default.Int, groupId)
            .input('maNguoiTao', mssql_1.default.Int, userId)
            .query(`
        INSERT INTO MonAn (
          TenMon, CongThuc, HuongDan, ThoiGian, KhauPhan,
          DoKho, DanhMuc, MoTa, HinhAnh, MaNhom, MaNguoiTao
        )
        OUTPUT INSERTED.MaMon
        VALUES (
          @ten, @ct, @hd, @thoiGian, @khauPhan,
          @doKho, @danhMuc, @moTa, @hinhAnh, @maNhom, @maNguoiTao
        )
      `);
        return result.recordset[0].MaMon;
    }
    /**
     * Cập nhật thông tin công thức.
     * Không cập nhật MaNhom và MaNguoiTao (bất biến sau khi tạo).
     */
    async update(id, data) {
        const pool = await (0, database_1.getPool)();
        await pool
            .request()
            .input('id', mssql_1.default.Int, id)
            .input('ten', mssql_1.default.NVarChar, data.tenMon)
            .input('ct', mssql_1.default.NVarChar, data.congThuc || null)
            .input('hd', mssql_1.default.NVarChar, data.huongDan || null)
            .input('thoiGian', mssql_1.default.Int, data.thoiGian || null)
            .input('khauPhan', mssql_1.default.Int, data.khauPhan || null)
            .input('doKho', mssql_1.default.NVarChar, data.doKho || null)
            .input('danhMuc', mssql_1.default.NVarChar, data.danhMuc || null)
            .input('moTa', mssql_1.default.NVarChar, data.moTa || null)
            .input('hinhAnh', mssql_1.default.NVarChar, data.hinhAnh || null)
            .query(`
        UPDATE MonAn SET
          TenMon   = ISNULL(@ten, TenMon),
          CongThuc = @ct,
          HuongDan = @hd,
          ThoiGian = @thoiGian,
          KhauPhan = @khauPhan,
          DoKho    = ISNULL(@doKho, DoKho),
          DanhMuc  = ISNULL(@danhMuc, DanhMuc),
          MoTa     = @moTa,
          HinhAnh  = @hinhAnh
        WHERE MaMon = @id
      `);
    }
    /**
     * Xóa công thức theo ID.
     */
    async remove(id) {
        const pool = await (0, database_1.getPool)();
        await pool
            .request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM MonAn WHERE MaMon = @id');
    }
    /**
     * Gợi ý công thức theo nguyên liệu có sẵn trong kho.
     * Logic: tìm các công thức (theo tên nguyên liệu) có thể nấu được
     * với những gì đang có trong kho của nhóm (TrangThai = 'CON_HAN', SoLuong > 0).
     *
     * Trả về: danh sách công thức kèm số nguyên liệu đủ / tổng nguyên liệu.
     */
    async getSuggestedByInventory(groupId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('groupId', mssql_1.default.Int, groupId)
            .query(`
        WITH KhoHienCo AS (
          -- Danh sách nguyên liệu trong kho còn hạn, còn số lượng
          SELECT TenTP, SoLuong, DonVi
          FROM KhoThucPham
          WHERE MaNhom = @groupId
            AND TrangThai = 'CON_HAN'
            AND SoLuong > 0
        ),
        NguyenLieuCongThuc AS (
          -- Tổng nguyên liệu theo từng món (từ trường CongThuc dạng text)
          -- Lấy từ NguyenLieuMon nếu có, hoặc đếm từ CongThuc
          SELECT nl.MaMon, COUNT(*) AS TongNL,
            SUM(CASE WHEN k.TenTP IS NOT NULL THEN 1 ELSE 0 END) AS NLDu
          FROM NguyenLieuMon nl
          JOIN KhoThucPham ktp ON nl.MaTP = ktp.MaTP AND ktp.MaNhom = @groupId
          LEFT JOIN KhoHienCo k ON k.TenTP = ktp.TenTP AND k.SoLuong >= nl.SoLuongCan
          GROUP BY nl.MaMon
        )
        SELECT
          m.MaMon, m.TenMon, m.ThoiGian, m.KhauPhan, m.DoKho,
          m.DanhMuc, m.MoTa, m.HinhAnh, m.CongThuc, m.HuongDan,
          m.MaNhom, m.MaNguoiTao,
          ISNULL(nlct.TongNL, 0) AS TongNguyenLieu,
          ISNULL(nlct.NLDu, 0)   AS NguyenLieuDu
        FROM MonAn m
        LEFT JOIN NguyenLieuCongThuc nlct ON m.MaMon = nlct.MaMon
        WHERE (m.MaNhom IS NULL OR m.MaNhom = @groupId)
          AND nlct.TongNL > 0   -- Chỉ lấy món có nguyên liệu được map
        ORDER BY
          CAST(nlct.NLDu AS FLOAT) / NULLIF(nlct.TongNL, 0) DESC,
          nlct.NLDu DESC
      `);
        return result.recordset;
    }
    /**
     * Trừ nguyên liệu trong kho khi user nhấn "Đã nấu xong".
     * Tìm theo tên nguyên liệu (tên gần đúng) trong kho của nhóm.
     * Lý do dùng tên: linh hoạt hơn khi kho mỗi gia đình khác nhau.
     *
     * @param monId       ID công thức
     * @param groupId     ID nhóm gia đình
     * @param multiplier  Hệ số nhân (soKhauPhan / khauPhanGoc)
     */
    async deductInventoryForCooking(monId, groupId, multiplier) {
        const pool = await (0, database_1.getPool)();
        // Lấy nguyên liệu của công thức từ NguyenLieuMon JOIN KhoThucPham
        const nlResult = await pool
            .request()
            .input('monId', mssql_1.default.Int, monId)
            .input('groupId', mssql_1.default.Int, groupId)
            .query(`
        SELECT nl.SoLuongCan, k.TenTP, k.MaTP, k.SoLuong
        FROM NguyenLieuMon nl
        JOIN KhoThucPham k ON nl.MaTP = k.MaTP
        WHERE nl.MaMon = @monId AND k.MaNhom = @groupId
      `);
        const ingredients = nlResult.recordset;
        let deducted = 0;
        const notFound = [];
        for (const ing of ingredients) {
            const needed = ing.SoLuongCan * multiplier;
            if (ing.SoLuong >= needed) {
                // Trừ số lượng trong kho
                await pool
                    .request()
                    .input('maTP', mssql_1.default.Int, ing.MaTP)
                    .input('soLuong', mssql_1.default.Decimal(10, 2), needed)
                    .query(`
            UPDATE KhoThucPham
            SET SoLuong = SoLuong - @soLuong,
                TrangThai = CASE WHEN SoLuong - @soLuong <= 0 THEN 'HET' ELSE TrangThai END
            WHERE MaTP = @maTP
          `);
                deducted++;
            }
            else {
                // Trừ hết những gì còn lại (partial deduction)
                if (ing.SoLuong > 0) {
                    await pool
                        .request()
                        .input('maTP', mssql_1.default.Int, ing.MaTP)
                        .query(`
              UPDATE KhoThucPham
              SET SoLuong = 0, TrangThai = 'HET'
              WHERE MaTP = @maTP
            `);
                }
                notFound.push(ing.TenTP);
            }
        }
        return { deducted, notFound };
    }
}
exports.RecipesRepository = RecipesRepository;
