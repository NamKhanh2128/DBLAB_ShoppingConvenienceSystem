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
const INVITE_CHARSET   = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_LENGTH    = 8;
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
    const isSelf   = targetUserId === requesterId;
    if (!isLeader && !isSelf) throw { statusCode: 403, message: 'Không có quyền thực hiện thao tác này' };

    // Trưởng nhóm không được tự rời (cần chuyển quyền trước)
    if (isSelf && isLeader) throw { statusCode: 400, message: 'Trưởng nhóm cần chuyển quyền trước khi rời nhóm' };

    await this.repo.removeMember(groupId, targetUserId);
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

    const code     = generateInviteCode();
    const maxUses  = dto.maxUses ?? 1;
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

    const invite = await this.repo.createInvite(groupId, requesterId, code, maxUses, expiresAt);

    return {
      code        : invite.Code,
      maxUses     : invite.MaxUses,
      expiresAt   : invite.ExpiresAt,
      // Thông tin tiện lợi cho frontend hiển thị
      expiresInHours: 48,
      groupName   : group.TenNhom,
    };
  }

  async revokeInvite(inviteId: string, requesterId: number) {
    await this.repo.revokeInvite(inviteId, requesterId);
  }

  // ── JOIN FAMILY ────────────────────────────────────────────────────────────

  /**
   * User dùng mã mời để tham gia nhóm.
   * Toàn bộ validation + insert diễn ra trong 1 DB transaction (xem repository).
   */
  async joinFamily(userId: number, inviteCode: string) {
    // Repository xử lý toàn bộ: lock → validate → insert → commit
    return this.repo.joinFamilyTransaction(inviteCode, userId);
  }
}
