import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { createSuccess } from '../../core/utils/response';

const svc = new InventoryService();

export class InventoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getInventory(Number(req.query.groupId))); } catch (e) { next(e); }
  }
  async getExpiring(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getExpiring(Number(req.query.groupId))); } catch (e) { next(e); }
  }
  async add(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.addFood(req.body), 'Thêm thực phẩm thành công', 201); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { await svc.updateFood(Number(req.params.id), req.body); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await svc.deleteFood(Number(req.params.id)); return createSuccess(res, null, 'Xóa thành công'); } catch (e) { next(e); }
  }
}
