import { getPool } from '../../config/database';
import sql from 'mssql';

export interface KhoThucPhamRow {
  MaTP: number;
  MaNhom: number;
  TenTP: string;
  SoLuong: number;
  DonVi: string;
  HanSuDung: Date | null;
  ViTri: string | null;
  NgayNhap: Date;
  TrangThai: string;
  Version: number;
  NgayCapNhat: Date;
}

export class InventoryRepository {

  async getById(id: number): Promise<KhoThucPhamRow | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM KhoThucPham WHERE MaTP = @id');
    return result.recordset[0] ?? null;
  }

  async getByGroup(groupId: number): Promise<KhoThucPhamRow[]> {
    const pool = await getPool();
    
    // 1. Tự động đồng bộ hóa các vật phẩm quá hạn thành trạng thái 'HET_HAN'
    //    CHỈ cập nhật trong phạm vi nhóm gia đình đang được truy vấn (tránh side-effect toàn bảng)
    await pool.request()
      .input('gSync', sql.Int, groupId)
      .query(`
        UPDATE KhoThucPham
        SET TrangThai = 'HET_HAN', NgayCapNhat = GETDATE()
        WHERE MaNhom = @gSync
          AND HanSuDung < CAST(GETDATE() AS DATE)
          AND TrangThai = 'CON_HAN'
      `);

    // 2. Lấy danh sách thực phẩm
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .query('SELECT * FROM KhoThucPham WHERE MaNhom = @g ORDER BY HanSuDung ASC, NgayNhap DESC');
    return result.recordset;
  }

  async getExpiring(groupId: number, days: number = 3): Promise<KhoThucPhamRow[]> {
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

  async add(data: any, creatorId: number): Promise<number> {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();
      
      const result = await tx.request()
        .input('g', sql.Int, data.maNhom)
        .input('ten', sql.NVarChar(100), data.tenTP)
        .input('sl', sql.Decimal(10,2), data.soLuong)
        .input('dv', sql.NVarChar(50), data.donVi || 'cái')
        .input('hsd', sql.Date, data.hanSuDung || null)
        .input('vt', sql.NVarChar(100), data.viTri || null)
        .query(`
          INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, Version, NgayCapNhat)
          OUTPUT INSERTED.MaTP
          VALUES (@g, @ten, @sl, @dv, @hsd, @vt, 1, GETDATE())
        `);
      
      const newId = result.recordset[0].MaTP;

      // Ghi nhật ký kho
      await tx.request()
        .input('tp', sql.Int, newId)
        .input('ten', sql.NVarChar(100), data.tenTP)
        .input('nhom', sql.Int, data.maNhom)
        .input('user', sql.Int, creatorId)
        .input('act', sql.NVarChar(50), 'THEM_MOI')
        .input('before', sql.Decimal(10,2), 0)
        .input('after', sql.Decimal(10,2), data.soLuong)
        .input('dv', sql.NVarChar(50), data.donVi || 'cái')
        .input('note', sql.NVarChar(255), data.viTri ? `Cất tại: ${data.viTri}` : 'Thêm mới thực phẩm')
        .query(`
          INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, GhiChu)
          VALUES (@tp, @ten, @nhom, @user, @act, @before, @after, @dv, @note)
        `);

      await tx.commit();
      return newId;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  /**
   * Cập nhật thông tin thực phẩm an toàn sử dụng OCC (Optimistic Concurrency Control)
   */
  async update(id: number, data: any, updaterId: number, existing: KhoThucPhamRow): Promise<boolean> {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();

      // Xác định giá trị cập nhật: ưu tiên data mới, fallback về giá trị cũ
      const newTenTP   = (data.tenTP   !== undefined && data.tenTP   !== null) ? data.tenTP   : existing.TenTP;
      const newDonVi   = (data.donVi   !== undefined)                          ? data.donVi   : existing.DonVi;
      const newViTri   = (data.viTri   !== undefined)                          ? data.viTri   : existing.ViTri;
      const newTrangThai = data.trangThai || existing.TrangThai;
      // hanSuDung: cho phép set về null khi truyền null rõ ràng
      const newHanSuDung = (data.hanSuDung !== undefined) ? (data.hanSuDung || null) : existing.HanSuDung;

      // Cập nhật với kiểm tra chéo Version để tránh Dirty Write
      const result = await tx.request()
        .input('id',  sql.Int,           id)
        .input('sl',  sql.Decimal(10,2), data.soLuong)
        .input('ten', sql.NVarChar(100), newTenTP)
        .input('dv',  sql.NVarChar(50),  newDonVi  || null)
        .input('hsd', sql.Date,          newHanSuDung || null)
        .input('tt',  sql.NVarChar(30),  newTrangThai)
        .input('vt',  sql.NVarChar(100), newViTri  || null)
        .input('v',   sql.Int,           data.version)
        .query(`
          UPDATE KhoThucPham 
          SET SoLuong     = @sl,
              TenTP       = @ten,
              DonVi       = @dv,
              HanSuDung   = @hsd,
              TrangThai   = @tt,
              ViTri       = @vt,
              Version     = Version + 1,
              NgayCapNhat = GETDATE()
          WHERE MaTP = @id AND Version = @v
        `);

      if (result.rowsAffected[0] === 0) {
        await tx.rollback();
        return false; // Thất bại do xung đột OCC
      }

      // Xác định hành động và ghi chú log
      let action = 'CAP_NHAT';
      const notes: string[] = [];

      if (newTenTP !== existing.TenTP) {
        notes.push(`Đổi tên: "${existing.TenTP}" → "${newTenTP}"`);
      }
      if (data.soLuong !== existing.SoLuong) {
        if (data.soLuong === 0) {
          action = 'TIEU_THU';
          notes.push('Đã tiêu thụ hết sạch.');
        } else if (data.soLuong < existing.SoLuong) {
          action = 'TIEU_THU';
          notes.push(`Đã tiêu thụ bớt (Giảm ${existing.SoLuong - data.soLuong} ${existing.DonVi || ''}).`);
        } else {
          notes.push(`Tăng số lượng (Thêm ${data.soLuong - existing.SoLuong} ${existing.DonVi || ''}).`);
        }
      }
      if (newViTri !== existing.ViTri) {
        notes.push(`Chuyển vị trí: ${existing.ViTri || 'chưa xác định'} → ${newViTri || 'chưa xác định'}.`);
      }
      const note = notes.length > 0 ? notes.join(' ') : 'Cập nhật thực phẩm.';

      // Ghi nhật ký kho
      await tx.request()
        .input('tp',     sql.Int,           id)
        .input('ten',    sql.NVarChar(100),  newTenTP)
        .input('nhom',   sql.Int,           existing.MaNhom)
        .input('user',   sql.Int,           updaterId)
        .input('act',    sql.NVarChar(50),  action)
        .input('before', sql.Decimal(10,2), existing.SoLuong)
        .input('after',  sql.Decimal(10,2), data.soLuong)
        .input('dv',     sql.NVarChar(50),  existing.DonVi || newDonVi || null)
        .input('note',   sql.NVarChar(255), note)
        .query(`
          INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, GhiChu)
          VALUES (@tp, @ten, @nhom, @user, @act, @before, @after, @dv, @note)
        `);

      await tx.commit();
      return true;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  async remove(id: number, deleterId: number, existing: KhoThucPhamRow): Promise<void> {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();

      // 1. Ghi nhật ký xóa trước khi xóa cứng để lưu vết
      await tx.request()
        .input('tp', sql.Int, id)
        .input('ten', sql.NVarChar(100), existing.TenTP)
        .input('nhom', sql.Int, existing.MaNhom)
        .input('user', sql.Int, deleterId)
        .input('act', sql.NVarChar(50), 'XOA')
        .input('before', sql.Decimal(10,2), existing.SoLuong)
        .input('after', sql.Decimal(10,2), 0)
        .input('dv', sql.NVarChar(50), existing.DonVi)
        .input('note', sql.NVarChar(255), `Đã loại bỏ hoàn toàn vật phẩm khỏi kho.`)
        .query(`
          INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, GhiChu)
          VALUES (@tp, @ten, @nhom, @user, @act, @before, @after, @dv, @note)
        `);

      // 2. Thực hiện xóa cứng khỏi KhoThucPham
      await tx.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM KhoThucPham WHERE MaTP = @id');

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  async getAuditLogs(groupId: number): Promise<any[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .query(`
        SELECT n.*, u.HoTen AS TenNguoiThucHien 
        FROM NhatKyKho n
        LEFT JOIN NguoiDung u ON n.NguoiThucHien = u.MaNguoiDung
        WHERE n.MaNhom = @g
        ORDER BY n.NgayThucHien DESC
      `);
    return result.recordset;
  }

  async countByGroup(groupId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
      .input('g', sql.Int, groupId)
      .query('SELECT COUNT(*) AS total FROM KhoThucPham WHERE MaNhom = @g');
    return result.recordset[0].total;
  }
}
