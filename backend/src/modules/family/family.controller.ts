import { Request, Response, NextFunction } from 'express';
import { FamilyService } from './family.service';
import { createSuccess } from '../../core/utils/response';

const svc = new FamilyService();

export class FamilyController {
  async getMyFamilies(req: any, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getUserFamilies(req.user.id)); } catch (e) { next(e); }
  }
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getMembers(Number(req.params.id))); } catch (e) { next(e); }
  }
  async create(req: any, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.createFamily(req.body.name, req.user.id), 'Tạo nhóm thành công', 201); } catch (e) { next(e); }
  }
  async addMember(req: Request, res: Response, next: NextFunction) {
    try { await svc.addMember(Number(req.params.id), req.body.userId); return createSuccess(res, null, 'Thêm thành viên thành công'); } catch (e) { next(e); }
  }
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try { await svc.removeMember(Number(req.params.id), Number(req.params.userId)); return createSuccess(res, null, 'Xóa thành viên thành công'); } catch (e) { next(e); }
  }
}
