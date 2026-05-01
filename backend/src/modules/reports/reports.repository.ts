import { getPool } from '../../config/database';
import sql from 'mssql';

export class ReportsRepository {
  async getByGroup(groupId: number) {
    const pool = await getPool();
    const result = await pool.request().input('g', sql.Int, groupId)
      .query('SELECT * FROM BaoCaoChiTieu WHERE MaNhom = @g ORDER BY NgayTao DESC');
    return result.recordset;
  }

  async getSummary(groupId: number) {
    const pool = await getPool();
    const result = await pool.request().input('g', sql.Int, groupId)
      .query(`
        SELECT 
          ISNULL(SUM(TongChiPhi), 0) AS TongChiPhi,
          ISNULL(SUM(TongLangPhi), 0) AS TongLangPhi,
          COUNT(*) AS SoBaoCao
        FROM BaoCaoChiTieu WHERE MaNhom = @g
      `);
    return result.recordset[0];
  }

  async create(data: any) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, data.maNhom)
      .input('tt', sql.NVarChar, data.tuanThang)
      .input('cp', sql.Decimal(12,2), data.tongChiPhi)
      .input('lp', sql.Decimal(12,2), data.tongLangPhi)
      .query('INSERT INTO BaoCaoChiTieu (MaNhom, TuanThang, TongChiPhi, TongLangPhi) OUTPUT INSERTED.MaBaoCao VALUES (@g, @tt, @cp, @lp)');
    return result.recordset[0].MaBaoCao;
  }
}
