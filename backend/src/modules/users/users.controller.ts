/**
 * users.controller.ts
 * Tầng HTTP — nhận Request, trích data từ body/params, gọi Service, trả Response.
 * Không chứa business logic hay SQL.
 */
import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './user.model';
import { createSuccess } from '../../core/utils/response';

const svc = new UsersService();

export class UsersController {

  // ─── GET ALL (Admin) ───────────────────────────────────────────────────────
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      return createSuccess(res, await svc.getAll());
    } catch (e) { next(e); }
  }

  // ─── GET ONE (Admin) ───────────────────────────────────────────────────────
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      return createSuccess(res, await svc.getById(Number(req.params.id)));
    } catch (e) { next(e); }
  }

  // ─── UPDATE PROFILE (Self-service) ────────────────────────────────────────
  // Endpoint: PUT /api/v1/users/profile
  // Body mong đợi: { hoTen?, email?, soDienThoai?, bio? }
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      }

      // Chỉ lấy đúng các field được phép update, tránh mass assignment
      const dto: UpdateProfileDto = {
        hoTen:       req.body.hoTen,
        email:       req.body.email,
        soDienThoai: req.body.soDienThoai,
        bio:         req.body.bio,
      };

      const updatedUser = await svc.updateProfile(userId, dto);
      return createSuccess(res, updatedUser, 'Cập nhật hồ sơ thành công');
    } catch (e) { next(e); }
  }

  // ─── CHANGE PASSWORD (Self-service) ───────────────────────────────────────
  // Endpoint: PUT /api/v1/users/change-password
  // Body mong đợi: { currentPassword, newPassword }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      }

      const dto: ChangePasswordDto = {
        currentPassword: req.body.currentPassword,
        newPassword:     req.body.newPassword,
      };

      const result = await svc.changePassword(userId, dto);
      return createSuccess(res, result, result.message);
    } catch (e) { next(e); }
  }

  // ─── ADMIN ACTIONS ─────────────────────────────────────────────────────────

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await svc.updateRole(Number(req.params.id), req.body.role);
      return createSuccess(res, updated, 'Cập nhật vai trò thành công');
    } catch (e) { next(e); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await svc.updateStatus(Number(req.params.id), req.body.status);
      return createSuccess(res, updated, 'Cập nhật trạng thái thành công');
    } catch (e) { next(e); }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await svc.deleteUser(Number(req.params.id));
      return createSuccess(res, null, 'Xóa thành công');
    } catch (e) { next(e); }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      return createSuccess(res, await svc.getStats());
    } catch (e) { next(e); }
  }
}
