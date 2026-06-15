"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRepository = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class ReportsRepository {
    async getByGroup(groupId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().input('g', mssql_1.default.Int, groupId)
            .query('SELECT * FROM BaoCaoChiTieu WHERE MaNhom = @g ORDER BY NgayTao DESC');
        return result.recordset;
    }
    async getSummary(groupId, timezoneOffset = 0, startDate, endDate) {
        const pool = await (0, database_1.getPool)();
        // Tạo request chính và thêm các tham số an toàn (SQL Injection protection)
        const request = pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('tz', mssql_1.default.Int, timezoneOffset);
        let dateFilter = '';
        if (startDate) {
            request.input('startDate', mssql_1.default.VarChar, startDate);
            dateFilter += ' AND ds.NgayTao >= CAST(@startDate AS DATE)';
        }
        if (endDate) {
            request.input('endDate', mssql_1.default.VarChar, endDate);
            dateFilter += ' AND ds.NgayTao <= CAST(@endDate AS DATE)';
        }
        // Nếu không có khoảng thời gian lọc, mặc định xem 30 ngày gần nhất (theo múi giờ local của user)
        let trendDateFilter = dateFilter;
        if (!startDate && !endDate) {
            trendDateFilter = ` AND ds.NgayTao >= DATEADD(day, -29, CAST(DATEADD(minute, -@tz, GETDATE()) AS DATE))`;
        }
        // 1. Query Tổng quan (Tổng chi phí thực tế của các món đã mua, tổng lãng phí ước tính từ thực phẩm hết hạn, số báo cáo đã hoàn thành)
        const summaryQuery = `
      SELECT 
        CAST(ISNULL(SUM(CASE WHEN ct.DaMua = 1 THEN CAST(ct.GiaThucTe * ct.SoLuong AS DECIMAL(12,2)) ELSE 0 END), 0) AS DECIMAL(12,2)) AS TongChiPhi,
        CAST(ISNULL((
          SELECT SUM(kp.SoLuong * ISNULL(
            (SELECT TOP 1 sub.GiaThucTe 
             FROM ChiTietMuaSam sub 
             INNER JOIN DanhSachMuaSam subDs ON sub.MaDanhSach = subDs.MaDanhSach 
             WHERE subDs.MaNhom = @g AND sub.TenThucPham = kp.TenTP AND sub.DaMua = 1 
             ORDER BY subDs.NgayTao DESC), 
            15000
          ))
          FROM KhoThucPham kp
          WHERE kp.MaNhom = @g AND kp.TrangThai = 'HET_HAN'
        ), 0) AS DECIMAL(12,2)) AS TongLangPhi,
        CAST(ISNULL((
          SELECT SUM((nk.SoLuongTruoc - nk.SoLuongSau) * ISNULL(
            (SELECT TOP 1 sub.GiaThucTe 
             FROM ChiTietMuaSam sub 
             INNER JOIN DanhSachMuaSam subDs ON sub.MaDanhSach = subDs.MaDanhSach 
             WHERE subDs.MaNhom = @g AND sub.TenThucPham = nk.TenTP AND sub.DaMua = 1 
             ORDER BY subDs.NgayTao DESC), 
            15000
          ))
          FROM NhatKyKho nk
          WHERE nk.MaNhom = @g AND nk.HanhDong = 'TIEU_THU'
            ${dateFilter.replace(/ds\.NgayTao/g, 'nk.NgayThucHien')}
        ), 0) AS DECIMAL(12,2)) AS TongTietKiem,
        COUNT(DISTINCT CASE WHEN ds.TrangThai = 'HOAN_THANH' THEN ds.MaDanhSach END) AS SoBaoCao
      FROM DanhSachMuaSam ds
      LEFT JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
      WHERE ds.MaNhom = @g ${dateFilter}
    `;
        // 2. Query Xu hướng chi tiêu theo thời gian (dd/MM)
        const trendQuery = `
      SELECT
        FORMAT(ds.NgayTao, 'dd/MM') AS label,
        CAST(ISNULL(SUM(CASE WHEN ct.DaMua = 1 THEN CAST(ct.GiaThucTe * ct.SoLuong AS DECIMAL(12,2)) ELSE 0 END), 0) AS DECIMAL(12,2)) AS value
      FROM DanhSachMuaSam ds
      LEFT JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
      WHERE ds.MaNhom = @g ${trendDateFilter}
      GROUP BY ds.NgayTao, FORMAT(ds.NgayTao, 'dd/MM')
      ORDER BY ds.NgayTao
    `;
        // 3. Query Phân bổ chi tiêu theo danh mục thực tế (DanhMucHang từ 008)
        const categoryQuery = `
      SELECT
        ISNULL(NULLIF(ct.DanhMucHang, ''), N'Khác') AS name,
        CAST(ISNULL(SUM(CASE WHEN ct.DaMua = 1 THEN CAST(ct.GiaThucTe * ct.SoLuong AS DECIMAL(12,2)) ELSE 0 END), 0) AS DECIMAL(12,2)) AS value
      FROM DanhSachMuaSam ds
      INNER JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
      WHERE ds.MaNhom = @g AND ct.DaMua = 1 ${dateFilter}
      GROUP BY ISNULL(NULLIF(ct.DanhMucHang, ''), N'Khác')
    `;
        const [summaryResult, trendResult, categoryResult] = await Promise.all([
            request.query(summaryQuery),
            pool.request()
                .input('g', mssql_1.default.Int, groupId)
                .input('tz', mssql_1.default.Int, timezoneOffset)
                .input('startDate', mssql_1.default.VarChar, startDate || null)
                .input('endDate', mssql_1.default.VarChar, endDate || null)
                .query(trendQuery),
            pool.request()
                .input('g', mssql_1.default.Int, groupId)
                .input('startDate', mssql_1.default.VarChar, startDate || null)
                .input('endDate', mssql_1.default.VarChar, endDate || null)
                .query(categoryQuery),
        ]);
        return {
            ...summaryResult.recordset[0],
            expenseTrend: trendResult.recordset,
            categorySpend: categoryResult.recordset,
        };
    }
    async create(data) {
        const pool = await (0, database_1.getPool)();
        // Lấy snapshot số lượng thành viên hiện tại của gia đình để tránh lệch lịch sử
        const memberCountRes = await pool.request()
            .input('g', mssql_1.default.Int, data.maNhom)
            .query('SELECT COUNT(*) AS cnt FROM ThanhVienNhom WHERE MaNhom = @g');
        const soThanhVien = memberCountRes.recordset[0]?.cnt || 1;
        const result = await pool.request()
            .input('g', mssql_1.default.Int, data.maNhom)
            .input('tt', mssql_1.default.NVarChar, data.tuanThang)
            .input('cp', mssql_1.default.Decimal(12, 2), data.tongChiPhi)
            .input('lp', mssql_1.default.Decimal(12, 2), data.tongLangPhi)
            .input('stv', mssql_1.default.Int, soThanhVien)
            .input('tc', mssql_1.default.Int, data.tongCalo || 0)
            .query(`
        INSERT INTO BaoCaoChiTieu (MaNhom, TuanThang, TongChiPhi, TongLangPhi, SoThanhVien, TongCalo, NgayTao) 
        OUTPUT INSERTED.MaBaoCao 
        VALUES (@g, @tt, @cp, @lp, @stv, @tc, GETDATE())
      `);
        return result.recordset[0].MaBaoCao;
    }
}
exports.ReportsRepository = ReportsRepository;
