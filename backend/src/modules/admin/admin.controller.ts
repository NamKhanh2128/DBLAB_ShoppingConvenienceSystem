import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { createSuccess } from '../../core/utils/response';

const svc = new AdminService();

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getDashboard()); } catch (e) { next(e); }
  }
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getUsers()); } catch (e) { next(e); }
  }
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try { await svc.updateUserStatus(Number(req.params.id), req.body.status); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try { await svc.updateUserRole(Number(req.params.id), req.body.role); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try { await svc.deleteUser(Number(req.params.id)); return createSuccess(res, null, 'Xóa thành công'); } catch (e) { next(e); }
  }
}
