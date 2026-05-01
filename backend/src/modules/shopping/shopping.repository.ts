import { getPool } from '../../config/database';
import sql from 'mssql';

export class ShoppingRepository {
  // ── DanhSachMuaSam ──
  async getListsByGroup(groupId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .query(`
        SELECT ds.*, 
          (SELECT COUNT(*) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach) AS TongMon,
          (SELECT COUNT(*) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach AND DaMua = 1) AS DaMuaCount,
          (SELECT ISNULL(SUM(GiaDuKien),0) FROM ChiTietMuaSam WHERE MaDanhSach = ds.MaDanhSach) AS TongGiaDuKien
        FROM DanhSachMuaSam ds WHERE ds.MaNhom = @g ORDER BY ds.NgayTao DESC
      `);
    return result.recordset;
  }

  async createList(groupId: number, ghiChu?: string) {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .input('gc', sql.NVarChar, ghiChu || null)
      .query(`INSERT INTO DanhSachMuaSam (MaNhom, GhiChu) OUTPUT INSERTED.MaDanhSach VALUES (@g, @gc)`);
    return result.recordset[0].MaDanhSach;
  }

  async updateListStatus(id: number, status: string) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id).input('s', sql.NVarChar, status)
      .query('UPDATE DanhSachMuaSam SET TrangThai = @s WHERE MaDanhSach = @id');
  }

  async deleteList(id: number) {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM DanhSachMuaSam WHERE MaDanhSach = @id');
  }

  // ── ChiTietMuaSam ──
  async getItems(listId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, listId)
      .query(`
        SELECT ct.*, u.HoTen AS TenNguoiPhuTrach
        FROM ChiTietMuaSam ct
        LEFT JOIN NguoiDung u ON ct.NguoiPhuTrach = u.MaNguoiDung
        WHERE ct.MaDanhSach = @id
      `);
    return result.recordset;
  }

  async addItem(listId: number, data: any) {
    const pool = await getPool();
    const result = await pool.request()
      .input('ds', sql.Int, listId)
      .input('ten', sql.NVarChar, data.tenThucPham)
      .input('sl', sql.Decimal(10,2), data.soLuong)
      .input('dv', sql.NVarChar, data.donVi || null)
      .input('npt', sql.Int, data.nguoiPhuTrach || null)
      .input('gdk', sql.Decimal(12,2), data.giaDuKien || 0)
      .query(`
        INSERT INTO ChiTietMuaSam (MaDanhSach, TenThucPham, SoLuong, DonVi, NguoiPhuTrach, GiaDuKien)
        OUTPUT INSERTED.MaCT
        VALUES (@ds, @ten, @sl, @dv, @npt, @gdk)
      `);
    return result.recordset[0].MaCT;
  }

  async toggleItem(id: number, done: boolean) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('done', sql.Bit, done ? 1 : 0)
      .query('UPDATE ChiTietMuaSam SET DaMua = @done WHERE MaCT = @id');
  }

  async updateItem(id: number, data: any) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('ten', sql.NVarChar, data.tenThucPham)
      .input('sl', sql.Decimal(10,2), data.soLuong)
      .input('dv', sql.NVarChar, data.donVi || null)
      .input('gdk', sql.Decimal(12,2), data.giaDuKien || 0)
      .query('UPDATE ChiTietMuaSam SET TenThucPham=@ten, SoLuong=@sl, DonVi=@dv, GiaDuKien=@gdk WHERE MaCT = @id');
  }

  async deleteItem(id: number) {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM ChiTietMuaSam WHERE MaCT = @id');
  }
}
