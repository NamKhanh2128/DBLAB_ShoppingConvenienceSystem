/**
 * family.controller.ts
 * HTTP layer — nhận Request, trích data, gọi Service, trả Response.
 * Không chứa business logic. Toàn bộ lỗi đẩy về next(error) để errorMiddleware xử lý.
 */
import { Response, NextFunction } from 'express';
import { FamilyService } from './family.service';
import { CreateFamilyDto, GenerateInviteDto, JoinFamilyDto } from './family.dto';
import { createSuccess } from '../../core/utils/response';
import { AuthenticatedRequest } from '../../core/middleware/auth.middleware';

const svc = new FamilyService();

export class FamilyController {

  // GET /api/v1/family/me — danh sách nhóm của tôi
  async getMyFamilies(req: any, res: Response, next: NextFunction) {
    try {
      const data = await svc.getUserFamilies(req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  // GET /api/v1/family/:groupId/members — danh sách thành viên
  async getMembers(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const data = await svc.getMembers(groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  // GET /api/v1/family/:groupId/invites — danh sách mã mời (leader only qua service)
  async getInvites(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const data = await svc.getGroupInvites(groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  // POST /api/v1/family — tạo nhóm mới
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const dto: CreateFamilyDto = {
        name: req.body.name,
        description: req.body.description,
        maxMembers: req.body.maxMembers,
      };
      const data = await svc.createFamily(req.user.id, dto);
      return createSuccess(res, data, 'Tạo nhóm thành công', 201);
    } catch (e) { next(e); }
  }

  // POST /api/v1/family/:groupId/invites — tạo mã mời
  async generateInvite(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const dto: GenerateInviteDto = { maxUses: req.body.maxUses };
      const data = await svc.generateInvite(req.user.id, groupId, dto);
      return createSuccess(res, data, 'Tạo mã mời thành công', 201);
    } catch (e) { next(e); }
  }

  // POST /api/v1/family/join — dùng mã mời để tham gia
  async joinFamily(req: any, res: Response, next: NextFunction) {
    try {
      const { inviteCode }: JoinFamilyDto = req.body;
      const data = await svc.joinFamily(req.user.id, inviteCode);
      return createSuccess(res, data, `Tham gia nhóm "${data.TenNhom}" thành công`);
    } catch (e) { next(e); }
  }

  // DELETE /api/v1/family/:groupId/members/:userId — kick thành viên hoặc tự rời
  async removeMember(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const targetUserId = Number(req.params.userId);
      await svc.removeMember(groupId, targetUserId, req.user.id);
      return createSuccess(res, null, 'Đã xóa thành viên khỏi nhóm');
    } catch (e) { next(e); }
  }

  // DELETE /api/v1/family/:groupId/invites/:inviteId — thu hồi mã mời
  async revokeInvite(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const inviteId = String(req.params.inviteId); // Ép kiểu chuỗi tuyệt đối an toàn

      // Truyền đủ groupId, inviteId và userId xuống tầng logic
      await svc.revokeInvite(groupId, inviteId, req.user.id);
      return createSuccess(res, null, 'Đã thu hồi mã mời');
    } catch (e) { next(e); }
  }

  // PUT /api/v1/family/:groupId/transfer-leadership — chuyển nhượng quyền chủ hộ
  async transferLeadership(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const { newLeaderId } = req.body;
      if (!newLeaderId) throw { statusCode: 400, message: 'Thiếu thông tin người nhận chuyển nhượng' };

      await svc.transferGroupLeadership(groupId, Number(newLeaderId), req.user.id);
      return createSuccess(res, null, 'Chuyển nhượng quyền chủ hộ gia đình thành công');
    } catch (e) { next(e); }
  }

  // PUT /api/v1/family/:groupId/info — cập nhật thông tin nhóm gia đình OCC
  async updateFamilyInfo(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const { name, description, lastSeenUpdatedAt } = req.body;
      if (!name) throw { statusCode: 400, message: 'Tên nhóm gia đình không được để trống' };
      if (!lastSeenUpdatedAt) throw { statusCode: 400, message: 'Thiếu mã thời gian cập nhật gần nhất' };

      const data = await svc.updateGroupInfo(groupId, name, description, lastSeenUpdatedAt, req.user.id);
      return createSuccess(res, data, 'Cập nhật thông tin gia đình thành công');
    } catch (e) { next(e); }
  }

  // GET /api/v1/family/:groupId/notifications — lấy thông báo hoạt động realtime của gia đình
  async getNotifications(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.groupId);
      const data = await svc.getNotifications(groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }
}