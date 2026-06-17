/**
 * family.service.ts
 * Business logic layer — không chứa SQL, không chứa HTTP objects.
 *
 * Key decisions:
 *   • generateInviteCode(): dùng crypto.randomBytes (CSPRNG) thay vì Math.random()
 *     để mã không thể bị đoán. Loại bỏ ký tự gây nhầm lẫn (0/O, 1/I).
 *   • Expiry 48h: tính từ thời điểm generate, lưu UTC.
 *   • generateInvite(): kiểm tra quyền (chỉ LEADER được gen mã).
 *   • joinFamily(): toàn bộ delegate xuống repository transaction.
 */
import crypto from 'crypto';
import { FamilyRepository } from './family.repository';
import { CreateFamilyDto, GenerateInviteDto } from './family.dto';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
// Loại bỏ: 0 (nhầm O), 1 (nhầm I/l), O, I để tránh ambiguity khi user gõ tay
const INVITE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_LENGTH = 8;
const INVITE_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 giờ

// ─── PURE HELPER ─────────────────────────────────────────────────────────────
/**
 * Tạo mã invite 8 ký tự ngẫu nhiên bảo mật.
 * Dùng rejection sampling để đảm bảo phân phối đều (tránh modulo bias).
 */
const generateInviteCode = (): string => {
  const charsetLen = INVITE_CHARSET.length; // 32
  const chars: string[] = [];

  // Lấy nhiều bytes hơn cần thiết để xử lý rejection sampling
  while (chars.length < INVITE_LENGTH) {
    const bytes = crypto.randomBytes(INVITE_LENGTH * 2);
    for (const byte of bytes) {
      // Chỉ lấy byte nằm trong range không có modulo bias (256 % 32 === 0 → hoàn hảo)
      if (byte < charsetLen * Math.floor(256 / charsetLen)) {
        chars.push(INVITE_CHARSET[byte % charsetLen]);
        if (chars.length === INVITE_LENGTH) break;
      }
    }
  }

  return chars.join('');
};

// ─── SERVICE ─────────────────────────────────────────────────────────────────
export class FamilyService {
  private repo = new FamilyRepository();

  // ── READ ───────────────────────────────────────────────────────────────────

  async getUserFamilies(userId: number) {
    return this.repo.getGroupsByUser(userId);
  }

  async getMembers(groupId: number, requesterId: number) {
    // Chỉ thành viên mới được xem danh sách
    const isMember = await this.repo.isMember(groupId, requesterId);
    if (!isMember) throw { statusCode: 403, message: 'Bạn không phải thành viên nhóm này' };
    return this.repo.getMembers(groupId);
  }

  async getGroupInvites(groupId: number, requesterId: number) {
    const isMember = await this.repo.isMember(groupId, requesterId);
    if (!isMember) throw { statusCode: 403, message: 'Bạn không phải thành viên nhóm này' };
    return this.repo.getInvitesByGroup(groupId);
  }

  // ── WRITE ──────────────────────────────────────────────────────────────────

  async createFamily(userId: number, dto: CreateFamilyDto) {
    const groupId = await this.repo.createGroup(userId, dto);
    return this.repo.getGroupById(groupId);
  }

  async removeMember(groupId: number, targetUserId: number, requesterId: number) {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm không tồn tại' };

    // Chỉ trưởng nhóm được kick người khác, hoặc tự rời
    const isLeader = group.TruongNhom === requesterId;
    const isSelf = targetUserId === requesterId;
    if (!isLeader && !isSelf) throw { statusCode: 403, message: 'Không có quyền thực hiện thao tác này' };

    // Trưởng nhóm không được tự rời (cần chuyển quyền trước) nếu vẫn còn người khác
    if (isSelf && isLeader) {
      const memberCount = await this.repo.getMemberCount(groupId);
      if (memberCount > 1) {
        throw { statusCode: 400, message: 'Trưởng nhóm cần bàn giao/chuyển quyền chủ hộ trước khi rời gia đình' };
      }
    }

    // Lấy tên thành viên rời/kick trước khi xóa khỏi nhóm
    const members = await this.repo.getMembers(groupId);
    const targetUser = members.find(m => m.MaNguoiDung === targetUserId);
    const name = targetUser ? targetUser.HoTen : 'Thành viên';

    await this.repo.removeMember(groupId, targetUserId);

    // Ghi nhận nhật ký hoạt động
    const logContent = isSelf 
      ? `${name} đã tự rời khỏi gia đình.` 
      : `${name} đã bị Trưởng nhóm mời ra khỏi gia đình.`;
    
    const remainingCount = members.length - 1;
    if (remainingCount > 0) {
      await this.repo.logActivity(groupId, logContent, 'LEAVE');
    }
  }

  // ── INVITE GENERATION ──────────────────────────────────────────────────────

  /**
   * Tạo mã mời cho nhóm.
   * Chỉ trưởng nhóm (LEADER) mới được tạo mã.
   * Mã hết hạn sau 48h kể từ lúc tạo.
   */
  async generateInvite(requesterId: number, groupId: number, dto: GenerateInviteDto) {
    // Guard: nhóm tồn tại
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm không tồn tại' };

    // Guard: chỉ trưởng nhóm được tạo mã mời
    if (group.TruongNhom !== requesterId)
      throw { statusCode: 403, message: 'Chỉ trưởng nhóm mới được tạo mã mời' };

    const code = generateInviteCode();
    const maxUses = Math.min(Math.max(dto.maxUses ?? 1, 1), 100);
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

    const invite = await this.repo.createInvite(groupId, requesterId, code, maxUses, expiresAt);

    return {
      code: invite.Code,
      maxUses: invite.MaxUses,
      expiresAt: invite.ExpiresAt,
      // Thông tin tiện lợi cho frontend hiển thị
      expiresInHours: 48,
      groupName: group.TenNhom,
    };
  }

  // groupId: dùng để verify invite thuộc đúng nhóm trước khi revoke
  // inviteId: UNIQUEIDENTIFIER (UUID string) — Id của dòng FamilyInvites
  async revokeInvite(groupId: number, inviteId: string, requesterId: number): Promise<void> {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm không tồn tại' };

    // Chỉ trưởng nhóm được thu hồi mã mời của người khác
    if (group.TruongNhom !== requesterId)
      throw { statusCode: 403, message: 'Chỉ trưởng nhóm mới được thu hồi mã mời' };

    await this.repo.revokeInvite(inviteId, requesterId);
  }

  // ── JOIN FAMILY ────────────────────────────────────────────────────────────

  /**
   * User dùng mã mời để tham gia nhóm.
   * Toàn bộ validation + insert diễn ra trong 1 DB transaction (xem repository).
   */
  async joinFamily(userId: number, inviteCode: string) {
    const res = await this.repo.joinFamilyTransaction(inviteCode, userId);
    
    // Lấy thông tin user vừa join để log
    const members = await this.repo.getMembers(res.MaNhom);
    const joinedUser = members.find(m => m.MaNguoiDung === userId);
    const name = joinedUser ? joinedUser.HoTen : 'Thành viên mới';

    await this.repo.logActivity(res.MaNhom, `${name} đã gia nhập gia đình qua liên kết mời.`, 'JOIN');
    return res;
  }

  // ── LEADERSHIP TRANSFER ───────────────────────────────────────────────────
  async transferGroupLeadership(groupId: number, newLeaderId: number, requesterId: number) {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm gia đình không tồn tại' };

    // 1. Chỉ trưởng nhóm hiện tại mới được quyền chuyển nhượng
    if (group.TruongNhom !== requesterId) {
      throw { statusCode: 403, message: 'Chỉ Trưởng nhóm mới có quyền chuyển nhượng quyền chủ hộ' };
    }

    // 2. Không được chuyển cho chính mình
    if (newLeaderId === requesterId) {
      throw { statusCode: 400, message: 'Bạn đã là Trưởng nhóm hiện tại rồi' };
    }

    // 3. New leader phải là thành viên hiện tại của nhóm
    const isMember = await this.repo.isMember(groupId, newLeaderId);
    if (!isMember) {
      throw { statusCode: 400, message: 'Người nhận chuyển quyền phải là thành viên trong gia đình' };
    }

    const members = await this.repo.getMembers(groupId);
    const oldLeader = members.find(m => m.MaNguoiDung === requesterId);
    const newLeader = members.find(m => m.MaNguoiDung === newLeaderId);

    const oldName = oldLeader ? oldLeader.HoTen : 'Trưởng nhóm cũ';
    const newName = newLeader ? newLeader.HoTen : 'Trưởng nhóm mới';

    await this.repo.transferLeadershipTransaction(groupId, requesterId, newLeaderId, oldName, newName);
    return { success: true };
  }

  // ── UPDATE GROUP INFO OCC ─────────────────────────────────────────────────
  async updateGroupInfo(groupId: number, name: string, desc: string | null, lastSeenUpdatedAt: string, requesterId: number) {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm gia đình không tồn tại' };

    if (group.TruongNhom !== requesterId) {
      throw { statusCode: 403, message: 'Chỉ Trưởng nhóm mới có quyền cập nhật thông tin nhóm' };
    }

    await this.repo.updateGroupInfoOCC(groupId, name.trim(), desc ? desc.trim() : null, lastSeenUpdatedAt);
    
    // Log hoạt động cập nhật
    await this.repo.logActivity(groupId, `Thông tin gia đình đã được cập nhật bởi Trưởng nhóm.`, 'INFO_UPDATE');

    return this.repo.getGroupById(groupId);
  }

  // ── GET FAMILY NOTIFICATIONS ──────────────────────────────────────────────
  async getNotifications(groupId: number, requesterId: number) {
    const isMember = await this.repo.isMember(groupId, requesterId);
    if (!isMember) throw { statusCode: 403, message: 'Bạn không phải là thành viên của nhóm gia đình này' };

    return this.repo.getNotificationsByGroup(groupId);
  }

  // ── UPDATE MEMBER INFO ────────────────────────────────────────────────────
  async updateMember(
    groupId: number,
    targetUserId: number,
    data: { hoTen?: string; soDienThoai?: string },
    requesterId: number
  ) {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm gia đình không tồn tại' };
    if (group.TruongNhom !== requesterId) {
      throw { statusCode: 403, message: 'Chỉ Trưởng nhóm mới có quyền sửa thông tin thành viên' };
    }
    await this.repo.updateMemberInfo(groupId, targetUserId, data);
    return this.repo.getMembers(groupId);
  }

  // ── UPDATE MEMBER ROLE ────────────────────────────────────────────────────
  async setMemberRole(
    groupId: number,
    targetUserId: number,
    role: string,
    requesterId: number
  ) {
    const VALID_ROLES = ['MEMBER', 'VIEWER'];
    if (!VALID_ROLES.includes(role)) {
      throw { statusCode: 400, message: 'Vai trò không hợp lệ. Chỉ chấp nhận: MEMBER, VIEWER (dùng chuyển nhượng để đổi LEADER)' };
    }
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw { statusCode: 404, message: 'Nhóm gia đình không tồn tại' };
    if (group.TruongNhom !== requesterId) {
      throw { statusCode: 403, message: 'Chỉ Trưởng nhóm mới có quyền thay đổi vai trò thành viên' };
    }
    if (targetUserId === requesterId) {
      throw { statusCode: 400, message: 'Bạn không thể tự thay đổi vai trò của mình' };
    }
    await this.repo.setMemberRole(groupId, targetUserId, role);
    await this.repo.logActivity(groupId, `Vai trò thành viên ID ${targetUserId} đã được cập nhật thành ${role}.`, 'INFO_UPDATE');
    return this.repo.getMembers(groupId);
  }
}
