import { getPool } from '../../config/database';
import sql from 'mssql';

export class RecipesRepository {
  async getAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM MonAn ORDER BY NgayTao DESC');
    return result.recordset;
  }

  async getById(id: number) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, id)
      .query('SELECT * FROM MonAn WHERE MaMon = @id');
    return result.recordset[0] || null;
  }

  async getIngredients(monId: number) {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, monId)
      .query(`
        SELECT nl.MaTP, k.TenTP, nl.SoLuongCan, k.DonVi, k.SoLuong AS SoLuongKho
        FROM NguyenLieuMon nl
        JOIN KhoThucPham k ON nl.MaTP = k.MaTP
        WHERE nl.MaMon = @id
      `);
    return result.recordset;
  }

  async create(data: any) {
    const pool = await getPool();
    const result = await pool.request()
      .input('ten', sql.NVarChar, data.tenMon)
      .input('ct', sql.NVarChar, data.congThuc || null)
      .input('hd', sql.NVarChar, data.huongDan || null)
      .query('INSERT INTO MonAn (TenMon, CongThuc, HuongDan) OUTPUT INSERTED.MaMon VALUES (@ten, @ct, @hd)');
    return result.recordset[0].MaMon;
  }

  async update(id: number, data: any) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('ten', sql.NVarChar, data.tenMon)
      .input('ct', sql.NVarChar, data.congThuc || null)
      .input('hd', sql.NVarChar, data.huongDan || null)
      .query('UPDATE MonAn SET TenMon=@ten, CongThuc=@ct, HuongDan=@hd WHERE MaMon = @id');
  }

  async remove(id: number) {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM MonAn WHERE MaMon = @id');
  }
}
