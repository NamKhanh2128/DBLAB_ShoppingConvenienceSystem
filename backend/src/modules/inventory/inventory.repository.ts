import { getPool } from '../../config/database';
import sql from 'mssql';

export class InventoryRepository {
  async getByGroup(groupId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .query('SELECT * FROM KhoThucPham WHERE MaNhom = @g ORDER BY NgayNhap DESC');
    return result.recordset;
  }

  async getExpiring(groupId: number, days: number = 3) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .input('d', sql.Int, days)
      .query(`
        SELECT * FROM KhoThucPham
        WHERE MaNhom = @g AND HanSuDung IS NOT NULL
          AND HanSuDung BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(day, @d, CAST(GETDATE() AS DATE))
          AND SoLuong > 0
        ORDER BY HanSuDung ASC
      `);
    return result.recordset;
  }

  async add(data: any) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, data.maNhom)
      .input('ten', sql.NVarChar, data.tenTP)
      .input('sl', sql.Decimal(10,2), data.soLuong)
      .input('dv', sql.NVarChar, data.donVi || null)
      .input('hsd', sql.Date, data.hanSuDung || null)
      .input('vt', sql.NVarChar, data.viTri || null)
      .query(`
        INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri)
        OUTPUT INSERTED.MaTP VALUES (@g, @ten, @sl, @dv, @hsd, @vt)
      `);
    return result.recordset[0].MaTP;
  }

  async update(id: number, data: any) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('sl', sql.Decimal(10,2), data.soLuong)
      .input('tt', sql.NVarChar, data.trangThai || 'CON_HAN')
      .input('vt', sql.NVarChar, data.viTri || null)
      .query('UPDATE KhoThucPham SET SoLuong=@sl, TrangThai=@tt, ViTri=@vt WHERE MaTP = @id');
  }

  async remove(id: number) {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM KhoThucPham WHERE MaTP = @id');
  }

  async countByGroup(groupId: number) {
    const pool = await getPool();
    const result = await pool.request().input('g', sql.Int, groupId)
      .query('SELECT COUNT(*) AS total FROM KhoThucPham WHERE MaNhom = @g');
    return result.recordset[0].total;
  }
}
