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
        SELECT kh.*, m.TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaNhom = @g AND kh.Ngay BETWEEN @s AND @e
        ORDER BY kh.Ngay, 
          CASE kh.Buoi WHEN 'SANG' THEN 1 WHEN 'TRUA' THEN 2 WHEN 'TOI' THEN 3 END
      `);
    return result.recordset;
  }

  async getToday(groupId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .query(`
        SELECT kh.*, m.TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaNhom = @g AND kh.Ngay = CAST(GETDATE() AS DATE)
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
