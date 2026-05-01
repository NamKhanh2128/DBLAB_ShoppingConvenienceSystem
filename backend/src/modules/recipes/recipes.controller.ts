import { Request, Response, NextFunction } from 'express';
import { RecipesService } from './recipes.service';
import { createSuccess } from '../../core/utils/response';

const svc = new RecipesService();

export class RecipesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getAll()); } catch (e) { next(e); }
  }
  async getOne(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getById(Number(req.params.id))); } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.create(req.body), 'Tạo món thành công', 201); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { await svc.update(Number(req.params.id), req.body); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await svc.remove(Number(req.params.id)); return createSuccess(res, null, 'Xóa thành công'); } catch (e) { next(e); }
  }
}
