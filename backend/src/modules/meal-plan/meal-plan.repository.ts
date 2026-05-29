import { getPool } from '../../config/database';
import sql from 'mssql';

export interface KeHoachBuaAnRow {
  MaKeHoach: number;
  MaNhom: number;
  Ngay: Date;
  Buoi: string;
  MaMon: number | null;
  TenMonAn: string | null;
  SoKhauPhan: number;
  GhiChu: string | null;
  TenMon: string | null;
  CongThuc: string | null;
}

export class MealPlanRepository {
  
  async getById(id: number): Promise<KeHoachBuaAnRow | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT kh.*, m.TenMon, m.CongThuc
        FROM KeHoachBuaAn kh
        LEFT JOIN MonAn m ON kh.MaMon = m.MaMon
        WHERE kh.MaKeHoach = @id
      `);
    return result.recordset[0] ?? null;
  }

  async getByGroupAndDate(groupId: number, startDate: string, endDate: string): Promise<KeHoachBuaAnRow[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .input('s', sql.Date, startDate)
      .input('e', sql.Date, endDate)
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

  async getToday(groupId: number, clientDate?: string): Promise<KeHoachBuaAnRow[]> {
    const pool = await getPool();
    const req = pool.request().input('g', sql.Int, groupId);
    let whereDate: string;
    if (clientDate) {
      req.input('today', sql.Date, clientDate);
      whereDate = 'kh.Ngay = @today';
    } else {
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

  async checkDuplicateMeal(groupId: number, date: string, buoi: string, monId: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .input('d', sql.Date, date)
      .input('b', sql.NVarChar(10), buoi)
      .input('m', sql.Int, monId)
      .query(`
        SELECT 1 AS HasDup 
        FROM KeHoachBuaAn 
        WHERE MaNhom = @g AND Ngay = @d AND Buoi = @b AND MaMon = @m
      `);
    return result.recordset.length > 0;
  }

  async create(data: any): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, data.maNhom)
      .input('ngay', sql.Date, data.ngay)
      .input('buoi', sql.NVarChar(10), data.buoi)
      .input('mon', sql.Int, data.maMon)
      .input('gc', sql.NVarChar(255), data.ghiChu || null)
      .input('skp', sql.Int, data.soKhauPhan || 4)
      .query(`
        DECLARE @ten NVARCHAR(200) = (SELECT TenMon FROM MonAn WHERE MaMon = @mon);
        INSERT INTO KeHoachBuaAn (MaNhom, Ngay, Buoi, MaMon, GhiChu, SoKhauPhan, TenMonAn)
        OUTPUT INSERTED.MaKeHoach
        VALUES (@g, @ngay, @buoi, @mon, @gc, @skp, @ten)
      `);
    return result.recordset[0].MaKeHoach;
  }

  async update(id: number, data: any): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('mon', sql.Int, data.maMon)
      .input('gc', sql.NVarChar(255), data.ghiChu || null)
      .input('skp', sql.Int, data.soKhauPhan || 4)
      .query(`
        DECLARE @ten NVARCHAR(200) = (SELECT TenMon FROM MonAn WHERE MaMon = @mon);
        UPDATE KeHoachBuaAn 
        SET MaMon = @mon, GhiChu = @gc, SoKhauPhan = @skp, TenMonAn = @ten 
        WHERE MaKeHoach = @id
      `);
  }

  async remove(id: number): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM KeHoachBuaAn WHERE MaKeHoach = @id');
  }

  /**
   * Nhân bản hàng loạt các bữa ăn từ khoảng thời gian nguồn sang thời điểm đích
   */
  async copyMeals(groupId: number, fromStart: string, fromEnd: string, toStart: string): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('fromS', sql.Date, fromStart)
      .input('fromE', sql.Date, fromEnd)
      .input('toS', sql.Date, toStart)
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
