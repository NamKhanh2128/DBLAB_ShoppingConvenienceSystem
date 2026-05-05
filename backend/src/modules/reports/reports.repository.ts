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
    const request = pool.request().input('g', sql.Int, groupId);

    const [summary, expenseTrend, categorySpend] = await Promise.all([
      request.query(`
        SELECT 
          ISNULL(SUM(ct.GiaDuKien * ct.SoLuong), 0) AS TongChiPhi,
          CAST(0 AS DECIMAL(12,2)) AS TongLangPhi,
          COUNT(DISTINCT ds.MaDanhSach) AS SoBaoCao
        FROM DanhSachMuaSam ds
        LEFT JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
        WHERE ds.MaNhom = @g
      `),
      pool.request().input('g', sql.Int, groupId).query(`
        SELECT
          FORMAT(ds.NgayTao, 'dd/MM') AS label,
          ISNULL(SUM(ct.GiaDuKien * ct.SoLuong), 0) AS value
        FROM DanhSachMuaSam ds
        LEFT JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
        WHERE ds.MaNhom = @g
          AND ds.NgayTao >= DATEADD(day, -6, CAST(GETDATE() AS DATE))
        GROUP BY CAST(ds.NgayTao AS DATE), FORMAT(ds.NgayTao, 'dd/MM')
        ORDER BY CAST(ds.NgayTao AS DATE)
      `),
      pool.request().input('g', sql.Int, groupId).query(`
        SELECT
          CASE
            WHEN ct.TenThucPham LIKE N'%rau%' OR ct.TenThucPham LIKE N'%củ%' THEN N'Rau củ'
            WHEN ct.TenThucPham LIKE N'%thịt%' OR ct.TenThucPham LIKE N'%cá%' OR ct.TenThucPham LIKE N'%gà%' THEN N'Thịt cá'
            WHEN ct.TenThucPham LIKE N'%trái%' OR ct.TenThucPham LIKE N'%quả%' THEN N'Trái cây'
            WHEN ct.TenThucPham LIKE N'%gia vị%' OR ct.TenThucPham LIKE N'%muối%' OR ct.TenThucPham LIKE N'%đường%' THEN N'Gia vị'
            ELSE N'Khác'
          END AS name,
          ISNULL(SUM(ct.GiaDuKien * ct.SoLuong), 0) AS value
        FROM DanhSachMuaSam ds
        INNER JOIN ChiTietMuaSam ct ON ds.MaDanhSach = ct.MaDanhSach
        WHERE ds.MaNhom = @g
        GROUP BY CASE
          WHEN ct.TenThucPham LIKE N'%rau%' OR ct.TenThucPham LIKE N'%củ%' THEN N'Rau củ'
          WHEN ct.TenThucPham LIKE N'%thịt%' OR ct.TenThucPham LIKE N'%cá%' OR ct.TenThucPham LIKE N'%gà%' THEN N'Thịt cá'
          WHEN ct.TenThucPham LIKE N'%trái%' OR ct.TenThucPham LIKE N'%quả%' THEN N'Trái cây'
          WHEN ct.TenThucPham LIKE N'%gia vị%' OR ct.TenThucPham LIKE N'%muối%' OR ct.TenThucPham LIKE N'%đường%' THEN N'Gia vị'
          ELSE N'Khác'
        END
      `),
    ]);

    return {
      ...summary.recordset[0],
      expenseTrend: expenseTrend.recordset,
      categorySpend: categorySpend.recordset,
    };
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
