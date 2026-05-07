import { getPool } from '../../config/database';
import sql from 'mssql';

export class MealPlanRepository {
  async getByGroupAndDate(groupId: number, startDate: string, endDate: string) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .input('s', sql.Date, startDate)
      .input('e', sql.Date, endDate)
      .query(`
        SELECT kh.MaKeHoach, kh.MaNhom, kh.Ngay, kh.Buoi, kh.MaMon, kh.GhiChu,
               m.TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        LEFT JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaNhom = @g AND kh.Ngay BETWEEN @s AND @e
        ORDER BY kh.Ngay,
          CASE kh.Buoi WHEN 'SANG' THEN 1 WHEN 'TRUA' THEN 2 WHEN 'TOI' THEN 3 END
      `);
    return result.recordset;
  }

  async getToday(groupId: number, clientDate?: string) {
    const pool = await getPool();
    const req = pool.request().input('g', sql.Int, groupId);
    let whereDate: string;
    if (clientDate) {
      // Client sends today's date as YYYY-MM-DD in their local timezone
      req.input('today', sql.Date, clientDate);
      whereDate = 'kh.Ngay = @today';
    } else {
      // Fallback: use server date (only correct if server is same timezone)
      whereDate = 'kh.Ngay = CAST(GETDATE() AS DATE)';
    }
    const result = await req.query(`
        SELECT kh.MaKeHoach, kh.MaNhom, kh.Ngay, kh.Buoi, kh.MaMon, kh.GhiChu,
               m.TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        LEFT JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaNhom = @g AND ${whereDate}
        ORDER BY CASE kh.Buoi WHEN 'SANG' THEN 1 WHEN 'TRUA' THEN 2 WHEN 'TOI' THEN 3 END
      `);
    return result.recordset;
  }

  async create(data: any) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, data.maNhom)
      .input('ngay', sql.Date, data.ngay)
      .input('buoi', sql.NVarChar, data.buoi)
      .input('mon', sql.Int, data.maMon)
      .input('gc', sql.NVarChar, data.ghiChu || null)
      .query(`
        INSERT INTO KeHoachBuaAn (MaNhom, Ngay, Buoi, MaMon, GhiChu)
        OUTPUT INSERTED.MaKeHoach
        VALUES (@g, @ngay, @buoi, @mon, @gc)
      `);
    return result.recordset[0].MaKeHoach;
  }

  async update(id: number, data: any) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('mon', sql.Int, data.maMon)
      .input('gc', sql.NVarChar, data.ghiChu || null)
      .query('UPDATE KeHoachBuaAn SET MaMon=@mon, GhiChu=@gc WHERE MaKeHoach = @id');
  }

  async remove(id: number) {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM KeHoachBuaAn WHERE MaKeHoach = @id');
  }
}
