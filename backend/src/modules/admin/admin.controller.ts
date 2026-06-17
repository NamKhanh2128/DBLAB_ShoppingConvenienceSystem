import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { createSuccess } from '../../core/utils/response';
import { getPool } from '../../config/database';
import sql from 'mssql';

const svc = new AdminService();

export class AdminController {
  private async getActor(req: Request): Promise<{ id: number; name: string; role: string; ip: string }> {
    const user = (req as any).user;
    const userId = Number(user?.id || 0);
    const userRole = String(user?.role || 'USER');
    const ip = String(req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');

    let name = 'Admin';
    if (userId) {
      const pool = await getPool();
      const result = await pool.request()
        .input('id', sql.Int, userId)
        .query('SELECT HoTen FROM NguoiDung WHERE MaNguoiDung = @id');
      name = result.recordset[0]?.HoTen || 'Admin';
    }

    return { id: userId, name, role: userRole, ip };
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try { 
      return createSuccess(res, await svc.getDashboard()); 
    } catch (e) { next(e); }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try { 
      return createSuccess(res, await svc.getUsers()); 
    } catch (e) { next(e); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try { 
      const actor = await this.getActor(req);
      await svc.updateUserStatus(Number(req.params.id), req.body.status, actor); 
      return createSuccess(res, null, 'Cập nhật trạng thái thành công'); 
    } catch (e) { next(e); }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try { 
      const actor = await this.getActor(req);
      await svc.updateUserRole(Number(req.params.id), req.body.role, actor); 
      return createSuccess(res, null, 'Cập nhật vai trò thành công'); 
    } catch (e) { next(e); }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try { 
      const actor = await this.getActor(req);
      await svc.deleteUser(Number(req.params.id), actor); 
      return createSuccess(res, null, 'Xóa người dùng thành công'); 
    } catch (e) { next(e); }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await svc.getAuditLogs();
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = await this.getActor(req);
      const tempPassword = await svc.resetUserPassword(Number(req.params.id), actor);
      return createSuccess(res, { tempPassword }, 'Reset mật khẩu thành công');
    } catch (e) { next(e); }
  }

  async cleanupFakeUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = await this.getActor(req);
      const result = await svc.cleanupFakeAccounts(actor);
      return createSuccess(res, result, `Đã dọn dẹp xong ${result.cleanedCount} tài khoản ảo.`);
    } catch (e) { next(e); }
  }
}
