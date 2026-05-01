import { getPool } from '../../config/database';
import sql from 'mssql';

export class FamilyRepository {
  async getGroupsByUser(userId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT n.MaNhom, n.TenNhom, n.TruongNhom, n.NgayTao, t.VaiTro,
          (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNhom = n.MaNhom) AS SoThanhVien
        FROM NhomGiaDinh n
        JOIN ThanhVienNhom t ON n.MaNhom = t.MaNhom
        WHERE t.MaNguoiDung = @userId
      `);
    return result.recordset;
  }

  async getMembers(groupId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT u.MaNguoiDung, u.HoTen, u.Email, t.VaiTro, t.NgayThamGia
        FROM ThanhVienNhom t
        JOIN NguoiDung u ON t.MaNguoiDung = u.MaNguoiDung
        WHERE t.MaNhom = @groupId
      `);
    return result.recordset;
  }

  async createGroup(name: string, leaderId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('leader', sql.Int, leaderId)
      .query(`
        INSERT INTO NhomGiaDinh (TenNhom, TruongNhom) OUTPUT INSERTED.MaNhom VALUES (@name, @leader)
      `);
    const groupId = result.recordset[0].MaNhom;
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('u', sql.Int, leaderId)
      .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@g, @u, 'LEADER')`);
    return groupId;
  }

  async addMember(groupId: number, userId: number) {
    const pool = await getPool();
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('u', sql.Int, userId)
      .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@g, @u, 'MEMBER')`);
  }

  async removeMember(groupId: number, userId: number) {
    const pool = await getPool();
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('u', sql.Int, userId)
      .query(`DELETE FROM ThanhVienNhom WHERE MaNhom = @g AND MaNguoiDung = @u`);
  }
}
