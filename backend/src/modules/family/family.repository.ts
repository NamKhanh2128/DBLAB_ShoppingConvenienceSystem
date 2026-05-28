/**
 * family.repository.ts
 * Tầng data access — toàn bộ queries dùng parameterized input để chống SQL Injection.
 *
 * THIẾT KẾ QUAN TRỌNG — joinFamilyTransaction:
 *   Dùng SQL Transaction + UPDLOCK hint để lock dòng FamilyInvites trước khi đọc.
 *   Điều này đảm bảo: nếu 2 user cùng dùng 1 mã mời cùng lúc, chỉ 1 người thành công.
 *   Race condition sẽ bị serialize tự động bởi SQL Server locking mechanism.
 */
import { getPool } from '../../config/database';
import sql from 'mssql';
import { CreateFamilyDto, GenerateInviteDto } from './family.dto';

// ─── RETURN TYPES ────────────────────────────────────────────────────────────
export interface FamilyRow {
  MaNhom       : number;
  TenNhom      : string;
  MoTa         : string | null;
  TruongNhom   : number;
  MaxThanhVien : number;
  SoThanhVien  : number;
  VaiTro       : string;
  NgayTao      : Date;
}

export interface InviteRow {
  Id          : string;
  MaNhom      : number;
  Code        : string;
  TaoBoiId    : number;
  MaxUses     : number;
  UsedCount   : number;
  ExpiresAt   : Date;
  IsDeleted   : boolean;
  NgayTao     : Date;
}

export interface JoinResult {
  MaNhom  : number;
  TenNhom : string;
}

// ─── REPOSITORY ──────────────────────────────────────────────────────────────
export class FamilyRepository {

  // ── READ ───────────────────────────────────────────────────────────────────

  async getGroupsByUser(userId: number): Promise<FamilyRow[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          n.MaNhom, n.TenNhom, n.MoTa, n.TruongNhom,
          ISNULL(n.MaxThanhVien, 10)  AS MaxThanhVien,
          t.VaiTro, n.NgayTao,
          (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNhom = n.MaNhom) AS SoThanhVien
        FROM NhomGiaDinh n
        JOIN ThanhVienNhom t ON n.MaNhom = t.MaNhom
        WHERE t.MaNguoiDung = @userId
          AND ISNULL(n.IsDeleted, 0) = 0
        ORDER BY n.NgayTao DESC
      `);
    return result.recordset;
  }

  async getGroupById(groupId: number): Promise<FamilyRow | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT
          n.MaNhom, n.TenNhom, n.MoTa, n.TruongNhom,
          ISNULL(n.MaxThanhVien, 10) AS MaxThanhVien, n.NgayTao,
          (SELECT COUNT(*) FROM ThanhVienNhom WHERE MaNhom = n.MaNhom) AS SoThanhVien
        FROM NhomGiaDinh n
        WHERE n.MaNhom = @groupId AND ISNULL(n.IsDeleted, 0) = 0
      `);
    return result.recordset[0] ?? null;
  }

  async getMembers(groupId: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT
          u.MaNguoiDung, u.HoTen, u.Email,
          t.VaiTro, t.NgayThamGia
        FROM ThanhVienNhom t
        JOIN NguoiDung u ON t.MaNguoiDung = u.MaNguoiDung
        WHERE t.MaNhom = @groupId
        ORDER BY t.NgayThamGia ASC
      `);
    return result.recordset;
  }

  async isMember(groupId: number, userId: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 1 AS IsMember
        FROM ThanhVienNhom
        WHERE MaNhom = @groupId AND MaNguoiDung = @userId
      `);
    return result.recordset.length > 0;
  }

  async getMemberCount(groupId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`SELECT COUNT(*) AS Total FROM ThanhVienNhom WHERE MaNhom = @groupId`);
    return result.recordset[0].Total;
  }

  // ── WRITE ──────────────────────────────────────────────────────────────────

  async createGroup(leaderId: number, dto: CreateFamilyDto): Promise<number> {
    const pool = await getPool();
    // INSERT nhóm — OUTPUT INSERTED để lấy PK vừa tạo
    const result = await pool.request()
      .input('name',       sql.NVarChar(100), dto.name)
      .input('desc',       sql.NVarChar(500), dto.description ?? null)
      .input('maxMembers', sql.Int,           dto.maxMembers ?? 10)
      .input('leader',     sql.Int,           leaderId)
      .query(`
        INSERT INTO NhomGiaDinh (TenNhom, MoTa, MaxThanhVien, TruongNhom)
        OUTPUT INSERTED.MaNhom
        VALUES (@name, @desc, @maxMembers, @leader)
      `);

    const groupId: number = result.recordset[0].MaNhom;

    // Thêm leader vào bảng thành viên luôn
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('u', sql.Int, leaderId)
      .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@g, @u, 'LEADER')`);

    return groupId;
  }

  async addMember(groupId: number, userId: number): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('u', sql.Int, userId)
      .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@g, @u, 'MEMBER')`);
  }

  async removeMember(groupId: number, userId: number): Promise<void> {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();

      // 1. Thu hồi các mã mời của người dùng này trong nhóm
      await tx.request()
        .input('g', sql.Int, groupId)
        .input('u', sql.Int, userId)
        .query(`UPDATE FamilyInvites SET IsDeleted = 1 WHERE MaNhom = @g AND TaoBoiId = @u`);

      // 2. Xóa khỏi bảng ThanhVienNhom
      await tx.request()
        .input('g', sql.Int, groupId)
        .input('u', sql.Int, userId)
        .query(`DELETE FROM ThanhVienNhom WHERE MaNhom = @g AND MaNguoiDung = @u`);

      // 3. Đếm số thành viên còn lại
      const countRes = await tx.request()
        .input('g', sql.Int, groupId)
        .query(`SELECT COUNT(*) AS Total FROM ThanhVienNhom WHERE MaNhom = @g`);

      const remaining = countRes.recordset[0].Total;

      if (remaining === 0) {
        // Nếu không còn ai, đánh dấu xóa nhóm (soft-delete) và bỏ trống trưởng nhóm
        await tx.request()
          .input('g', sql.Int, groupId)
          .query(`UPDATE NhomGiaDinh SET IsDeleted = 1, TruongNhom = NULL, NgayCapNhat = GETUTCDATE() WHERE MaNhom = @g`);
      }

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // ── INVITE ─────────────────────────────────────────────────────────────────

  async createInvite(
    groupId  : number,
    creatorId: number,
    code     : string,
    maxUses  : number,
    expiresAt: Date,
  ): Promise<InviteRow> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId',   sql.Int,          groupId)
      .input('creatorId', sql.Int,          creatorId)
      .input('code',      sql.NVarChar(8),  code)
      .input('maxUses',   sql.Int,          maxUses)
      .input('expires',   sql.DateTime2,    expiresAt)
      .query(`
        INSERT INTO FamilyInvites (Id, MaNhom, Code, TaoBoiId, MaxUses, ExpiresAt)
        OUTPUT INSERTED.*
        VALUES (NEWID(), @groupId, @code, @creatorId, @maxUses, @expires)
      `);
    return result.recordset[0];
  }

  async getInvitesByGroup(groupId: number): Promise<InviteRow[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT fi.*, u.HoTen AS TaoBoiTen
        FROM FamilyInvites fi
        JOIN NguoiDung u ON fi.TaoBoiId = u.MaNguoiDung
        WHERE fi.MaNhom = @groupId AND fi.IsDeleted = 0
        ORDER BY fi.NgayTao DESC
      `);
    return result.recordset;
  }

  async revokeInvite(inviteId: string, requesterId: number): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id',          sql.UniqueIdentifier, inviteId)
      .input('requesterId', sql.Int,              requesterId)
      .query(`
        UPDATE FamilyInvites
        SET IsDeleted = 1
        WHERE Id = @id AND TaoBoiId = @requesterId
      `);
  }

  // ── JOIN FAMILY — TRANSACTION CRITICAL SECTION ─────────────────────────────
  /**
   * Toàn bộ logic join được bọc trong 1 transaction với UPDLOCK.
   *
   * Tại sao UPDLOCK?
   *   - Nếu dùng SELECT thường (shared lock), 2 user có thể đọc cùng lúc
   *     và thấy UsedCount < MaxUses → cả 2 đều insert thành công → vượt giới hạn.
   *   - UPDLOCK chuyển shared lock thành update lock ngay lúc SELECT,
   *     buộc các transaction khác phải chờ → chỉ 1 transaction tại 1 thời điểm.
   *
   * Isolation level: READ_COMMITTED (mặc định) là đủ vì UPDLOCK handle race condition.
   */
  async joinFamilyTransaction(code: string, userId: number): Promise<JoinResult> {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);

    try {
      await tx.begin();

      // BƯỚC 1: Đọc & LOCK dòng invite — không transaction nào khác đọc được cho đến khi commit
      const inviteRes = await tx.request()
        .input('code', sql.NVarChar(8), code.toUpperCase())
        .query(`
          SELECT fi.Id, fi.MaNhom, fi.MaxUses, fi.UsedCount, fi.ExpiresAt, fi.IsDeleted,
                 n.TenNhom, n.MaxThanhVien, ISNULL(n.IsDeleted, 0) AS NhomDeleted
          FROM FamilyInvites fi WITH (UPDLOCK, ROWLOCK)
          JOIN NhomGiaDinh   n  ON fi.MaNhom = n.MaNhom
          WHERE fi.Code = @code
        `);

      const invite = inviteRes.recordset[0];

      // BƯỚC 2: Validate (sau khi đã lock — safe to check)
      if (!invite)                              throw { statusCode: 404, message: 'Mã mời không tồn tại' };
      if (invite.IsDeleted)                     throw { statusCode: 410, message: 'Mã mời đã bị thu hồi' };
      if (invite.NhomDeleted)                   throw { statusCode: 410, message: 'Nhóm không còn tồn tại' };
      if (new Date(invite.ExpiresAt) < new Date()) throw { statusCode: 410, message: 'Mã mời đã hết hạn (48h)' };
      if (invite.UsedCount >= invite.MaxUses)   throw { statusCode: 409, message: `Mã mời đã đạt giới hạn ${invite.MaxUses} lần dùng` };

      // BƯỚC 3: Kiểm tra xem user có đang thuộc nhóm nào khác trong hệ thống không
      const userGroupCheck = await tx.request()
        .input('userIdForGroupCheck', sql.Int, userId)
        .query(`SELECT MaNhom FROM ThanhVienNhom WHERE MaNguoiDung = @userIdForGroupCheck`);

      if (userGroupCheck.recordset.length > 0) {
        const currentGroupId = userGroupCheck.recordset[0].MaNhom;
        if (currentGroupId === invite.MaNhom) {
          throw { statusCode: 409, message: 'Bạn đã là thành viên của nhóm gia đình này rồi' };
        } else {
          throw {
            statusCode: 400,
            message: 'Bạn đang là thành viên của một nhóm gia đình khác. Vui lòng rời nhóm hiện tại trước khi tham gia nhóm mới.'
          };
        }
      }

      // BƯỚC 4: Kiểm tra giới hạn số thành viên
      const countRes = await tx.request()
        .input('groupId2', sql.Int, invite.MaNhom)
        .query(`SELECT COUNT(*) AS Total FROM ThanhVienNhom WHERE MaNhom = @groupId2`);

      if (countRes.recordset[0].Total >= invite.MaxThanhVien)
        throw { statusCode: 409, message: `Nhóm đã đạt giới hạn ${invite.MaxThanhVien} thành viên` };

      // BƯỚC 5: Thêm thành viên
      await tx.request()
        .input('groupId3', sql.Int, invite.MaNhom)
        .input('userId3',  sql.Int, userId)
        .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@groupId3, @userId3, 'MEMBER')`);

      // BƯỚC 6: Tăng UsedCount — atomically trong cùng transaction
      await tx.request()
        .input('code2', sql.NVarChar(8), code.toUpperCase())
        .query(`UPDATE FamilyInvites SET UsedCount = UsedCount + 1 WHERE Code = @code2`);

      await tx.commit();

      return { MaNhom: invite.MaNhom, TenNhom: invite.TenNhom };

    } catch (error) {
      // Rollback mọi thay đổi nếu bất kỳ bước nào lỗi
      await tx.rollback();
      throw error;
    }
  }

  // ─── LEADERSHIP TRANSFER ───────────────────────────────────────────────────
  async transferLeadershipTransaction(
    groupId: number,
    oldLeaderId: number,
    newLeaderId: number,
    oldLeaderName: string,
    newLeaderName: string
  ): Promise<void> {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    try {
      await tx.begin();

      // 1. Cập nhật trưởng nhóm trong NhomGiaDinh
      await tx.request()
        .input('groupId', sql.Int, groupId)
        .input('newLeaderId', sql.Int, newLeaderId)
        .query(`UPDATE NhomGiaDinh SET TruongNhom = @newLeaderId, NgayCapNhat = GETUTCDATE() WHERE MaNhom = @groupId`);

      // 2. Cập nhật vai trò mới thành LEADER trong ThanhVienNhom
      await tx.request()
        .input('groupId', sql.Int, groupId)
        .input('newLeaderId', sql.Int, newLeaderId)
        .query(`UPDATE ThanhVienNhom SET VaiTro = 'LEADER' WHERE MaNhom = @groupId AND MaNguoiDung = @newLeaderId`);

      // 3. Cập nhật vai trò cũ thành MEMBER trong ThanhVienNhom
      await tx.request()
        .input('groupId', sql.Int, groupId)
        .input('oldLeaderId', sql.Int, oldLeaderId)
        .query(`UPDATE ThanhVienNhom SET VaiTro = 'MEMBER' WHERE MaNhom = @groupId AND MaNguoiDung = @oldLeaderId`);

      // 4. Tạo log hoạt động
      const logContent = `${oldLeaderName} đã chuyển quyền Trưởng nhóm cho ${newLeaderName}.`;
      await tx.request()
        .input('groupId', sql.Int, groupId)
        .input('content', sql.NVarChar(500), logContent)
        .query(`INSERT INTO FamilyNotifications (MaNhom, NoiDung, Loai) VALUES (@groupId, @content, 'TRANSFER')`);

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // ─── OPTIMISTIC CONCURRENCY CONTROL (OCC) UPDATE ───────────────────────────
  async updateGroupInfoOCC(
    groupId: number,
    name: string,
    desc: string | null,
    lastSeenUpdatedAt: string
  ): Promise<void> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('name', sql.NVarChar(100), name)
      .input('desc', sql.NVarChar(500), desc)
      .input('lastSeen', sql.DateTime2, new Date(lastSeenUpdatedAt))
      .query(`
        UPDATE NhomGiaDinh 
        SET TenNhom = @name, MoTa = @desc, NgayCapNhat = GETUTCDATE()
        WHERE MaNhom = @groupId AND (NgayCapNhat = @lastSeen OR NgayCapNhat IS NULL)
      `);

    if (result.rowsAffected[0] === 0) {
      throw { statusCode: 409, message: 'Thông tin nhóm gia đình đã được cập nhật bởi một thành viên khác. Vui lòng tải lại trang để xem thông tin mới.' };
    }
  }

  // ─── FAMILY NOTIFICATIONS / ACTIVITY LOG ───────────────────────────────────
  async getNotificationsByGroup(groupId: number): Promise<any[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT Id, NoiDung, Loai, NgayTao 
        FROM FamilyNotifications 
        WHERE MaNhom = @groupId 
        ORDER BY NgayTao DESC
      `);
    return result.recordset;
  }

  async logActivity(groupId: number, content: string, type: string): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('content', sql.NVarChar(500), content)
      .input('type', sql.NVarChar(50), type)
      .query(`INSERT INTO FamilyNotifications (MaNhom, NoiDung, Loai) VALUES (@groupId, @content, @type)`);
  }
}
