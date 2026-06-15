"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyService = void 0;
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
const crypto_1 = __importDefault(require("crypto"));
const family_repository_1 = require("./family.repository");
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
const generateInviteCode = () => {
    const charsetLen = INVITE_CHARSET.length; // 32
    const chars = [];
    // Lấy nhiều bytes hơn cần thiết để xử lý rejection sampling
    while (chars.length < INVITE_LENGTH) {
        const bytes = crypto_1.default.randomBytes(INVITE_LENGTH * 2);
        for (const byte of bytes) {
            // Chỉ lấy byte nằm trong range không có modulo bias (256 % 32 === 0 → hoàn hảo)
            if (byte < charsetLen * Math.floor(256 / charsetLen)) {
                chars.push(INVITE_CHARSET[byte % charsetLen]);
                if (chars.length === INVITE_LENGTH)
                    break;
            }
        }
    }
    return chars.join('');
};
// ─── SERVICE ─────────────────────────────────────────────────────────────────
class FamilyService {
    repo = new family_repository_1.FamilyRepository();
    // ── READ ───────────────────────────────────────────────────────────────────
    async getUserFamilies(userId) {
        return this.repo.getGroupsByUser(userId);
    }
    async getMembers(groupId, requesterId) {
        // Chỉ thành viên mới được xem danh sách
        const isMember = await this.repo.isMember(groupId, requesterId);
        if (!isMember)
            throw { statusCode: 403, message: 'Bạn không phải thành viên nhóm này' };
        return this.repo.getMembers(groupId);
    }
    async getGroupInvites(groupId, requesterId) {
        const isMember = await this.repo.isMember(groupId, requesterId);
        if (!isMember)
            throw { statusCode: 403, message: 'Bạn không phải thành viên nhóm này' };
        return this.repo.getInvitesByGroup(groupId);
    }
    // ── WRITE ──────────────────────────────────────────────────────────────────
    async createFamily(userId, dto) {
        const groupId = await this.repo.createGroup(userId, dto);
        return this.repo.getGroupById(groupId);
    }
    async removeMember(groupId, targetUserId, requesterId) {
        const group = await this.repo.getGroupById(groupId);
        if (!group)
            throw { statusCode: 404, message: 'Nhóm không tồn tại' };
        // Chỉ trưởng nhóm được kick người khác, hoặc tự rời
        const isLeader = group.TruongNhom === requesterId;
        const isSelf = targetUserId === requesterId;
        if (!isLeader && !isSelf)
            throw { statusCode: 403, message: 'Không có quyền thực hiện thao tác này' };
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
    async generateInvite(requesterId, groupId, dto) {
        // Guard: nhóm tồn tại
        const group = await this.repo.getGroupById(groupId);
        if (!group)
            throw { statusCode: 404, message: 'Nhóm không tồn tại' };
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
    async revokeInvite(groupId, inviteId, requesterId) {
        const group = await this.repo.getGroupById(groupId);
        if (!group)
            throw { statusCode: 404, message: 'Nhóm không tồn tại' };
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
    async joinFamily(userId, inviteCode) {
        const res = await this.repo.joinFamilyTransaction(inviteCode, userId);
        // Lấy thông tin user vừa join để log
        const members = await this.repo.getMembers(res.MaNhom);
        const joinedUser = members.find(m => m.MaNguoiDung === userId);
        const name = joinedUser ? joinedUser.HoTen : 'Thành viên mới';
        await this.repo.logActivity(res.MaNhom, `${name} đã gia nhập gia đình qua liên kết mời.`, 'JOIN');
        return res;
    }
    // ── LEADERSHIP TRANSFER ───────────────────────────────────────────────────
    async transferGroupLeadership(groupId, newLeaderId, requesterId) {
        const group = await this.repo.getGroupById(groupId);
        if (!group)
            throw { statusCode: 404, message: 'Nhóm gia đình không tồn tại' };
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
    async updateGroupInfo(groupId, name, desc, lastSeenUpdatedAt, requesterId) {
        const group = await this.repo.getGroupById(groupId);
        if (!group)
            throw { statusCode: 404, message: 'Nhóm gia đình không tồn tại' };
        if (group.TruongNhom !== requesterId) {
            throw { statusCode: 403, message: 'Chỉ Trưởng nhóm mới có quyền cập nhật thông tin nhóm' };
        }
        await this.repo.updateGroupInfoOCC(groupId, name.trim(), desc ? desc.trim() : null, lastSeenUpdatedAt);
        // Log hoạt động cập nhật
        await this.repo.logActivity(groupId, `Thông tin gia đình đã được cập nhật bởi Trưởng nhóm.`, 'INFO_UPDATE');
        return this.repo.getGroupById(groupId);
    }
    // ── GET FAMILY NOTIFICATIONS ──────────────────────────────────────────────
    async getNotifications(groupId, requesterId) {
        const isMember = await this.repo.isMember(groupId, requesterId);
        if (!isMember)
            throw { statusCode: 403, message: 'Bạn không phải là thành viên của nhóm gia đình này' };
        return this.repo.getNotificationsByGroup(groupId);
    }
}
exports.FamilyService = FamilyService;
