"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealPlanRepository = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class MealPlanRepository {
    async getById(id) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query(`
        SELECT kh.*, m.TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        LEFT JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaKeHoach = @id
      `);
        return result.recordset[0] ?? null;
    }
    async getByGroupAndDate(groupId, startDate, endDate) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('s', mssql_1.default.Date, startDate)
            .input('e', mssql_1.default.Date, endDate)
            .query(`
        SELECT kh.MaKeHoach, kh.MaNhom, kh.Ngay, kh.Buoi, kh.MaMon, kh.GhiChu, kh.SoKhauPhan,
               ISNULL(m.TenMon, kh.TenMonAn) AS TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        LEFT JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaNhom = @g AND kh.Ngay BETWEEN @s AND @e
        ORDER BY kh.Ngay ASC,
          CASE kh.Buoi WHEN 'SANG' THEN 1 WHEN 'TRUA' THEN 2 WHEN 'TOI' THEN 3 END
      `);
        return result.recordset;
    }
    async getToday(groupId, clientDate) {
        const pool = await (0, database_1.getPool)();
        const req = pool.request().input('g', mssql_1.default.Int, groupId);
        let whereDate;
        if (clientDate) {
            req.input('today', mssql_1.default.Date, clientDate);
            whereDate = 'kh.Ngay = @today';
        }
        else {
            whereDate = 'kh.Ngay = CAST(GETDATE() AS DATE)';
        }
        const result = await req.query(`
        SELECT kh.MaKeHoach, kh.MaNhom, kh.Ngay, kh.Buoi, kh.MaMon, kh.GhiChu, kh.SoKhauPhan,
               ISNULL(m.TenMon, kh.TenMonAn) AS TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        LEFT JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaNhom = @g AND ${whereDate}
        ORDER BY CASE kh.Buoi WHEN 'SANG' THEN 1 WHEN 'TRUA' THEN 2 WHEN 'TOI' THEN 3 END
      `);
        return result.recordset;
    }
    async checkDuplicateMeal(groupId, date, buoi, monId) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('d', mssql_1.default.Date, date)
            .input('b', mssql_1.default.NVarChar(10), buoi)
            .input('m', mssql_1.default.Int, monId)
            .query(`
        SELECT 1 AS HasDup 
        FROM KeHoachBuaAn 
        WHERE MaNhom = @g AND Ngay = @d AND Buoi = @b AND MaMon = @m
      `);
        return result.recordset.length > 0;
    }
    async create(data) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request()
            .input('g', mssql_1.default.Int, data.maNhom)
            .input('ngay', mssql_1.default.Date, data.ngay)
            .input('buoi', mssql_1.default.NVarChar(10), data.buoi)
            .input('mon', mssql_1.default.Int, data.maMon)
            .input('gc', mssql_1.default.NVarChar(255), data.ghiChu || null)
            .input('skp', mssql_1.default.Int, data.soKhauPhan || 4)
            .query(`
        DECLARE @ten NVARCHAR(200) = (SELECT TenMon FROM MonAn WHERE MaMon = @mon);
        INSERT INTO KeHoachBuaAn (MaNhom, Ngay, Buoi, MaMon, GhiChu, SoKhauPhan, TenMonAn)
        OUTPUT INSERTED.MaKeHoach
        VALUES (@g, @ngay, @buoi, @mon, @gc, @skp, @ten)
      `);
        return result.recordset[0].MaKeHoach;
    }
    async update(id, data) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('mon', mssql_1.default.Int, data.maMon)
            .input('gc', mssql_1.default.NVarChar(255), data.ghiChu || null)
            .input('skp', mssql_1.default.Int, data.soKhauPhan || 4)
            .query(`
        DECLARE @ten NVARCHAR(200) = (SELECT TenMon FROM MonAn WHERE MaMon = @mon);
        UPDATE KeHoachBuaAn 
        SET MaMon = @mon, GhiChu = @gc, SoKhauPhan = @skp, TenMonAn = @ten 
        WHERE MaKeHoach = @id
      `);
    }
    async remove(id) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM KeHoachBuaAn WHERE MaKeHoach = @id');
    }
    /**
     * Nhân bản hàng loạt các bữa ăn từ khoảng thời gian nguồn sang thời điểm đích
     */
    async copyMeals(groupId, fromStart, fromEnd, toStart) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('fromS', mssql_1.default.Date, fromStart)
            .input('fromE', mssql_1.default.Date, fromEnd)
            .input('toS', mssql_1.default.Date, toStart)
            .query(`
        -- Nhân bản và tính toán bù ngày chính xác
        INSERT INTO KeHoachBuaAn (MaNhom, Ngay, Buoi, MaMon, GhiChu, SoKhauPhan, TenMonAn)
        SELECT 
          MaNhom, 
          DATEADD(day, DATEDIFF(day, @fromS, Ngay), @toS) AS NewNgay, 
          Buoi, 
          MaMon, 
          GhiChu, 
          SoKhauPhan, 
          TenMonAn
        FROM KeHoachBuaAn
        WHERE MaNhom = @g AND Ngay BETWEEN @fromS AND @fromE
      `);
    }
}
exports.MealPlanRepository = MealPlanRepository;
