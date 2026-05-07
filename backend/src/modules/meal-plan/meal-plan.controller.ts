import { Request, Response, NextFunction } from 'express';
import { MealPlanService } from './meal-plan.service';
import { createSuccess } from '../../core/utils/response';

const svc = new MealPlanService();

export class MealPlanController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId, start, end } = req.query;
      const data = await svc.getByDateRange(Number(groupId), String(start), String(end));
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }
  async getToday(req: Request, res: Response, next: NextFunction) {
    try {
      // Accept optional client-local date to avoid UTC vs UTC+7 mismatch
      const clientDate = req.query.date ? String(req.query.date) : undefined;
      return createSuccess(res, await svc.getToday(Number(req.query.groupId), clientDate));
    } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.create(req.body), 'Thêm kế hoạch thành công', 201); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { await svc.update(Number(req.params.id), req.body); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await svc.remove(Number(req.params.id)); return createSuccess(res, null, 'Xóa thành công'); } catch (e) { next(e); }
  }
}
