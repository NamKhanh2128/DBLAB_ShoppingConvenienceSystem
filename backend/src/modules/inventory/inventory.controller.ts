import { Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { createSuccess } from '../../core/utils/response';

const svc = new InventoryService();

export class InventoryController {
  
  async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.query.groupId);
      if (!groupId || isNaN(groupId)) throw { statusCode: 400, message: 'Thiếu tham số groupId' };
      const data = await svc.getInventory(groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  async getExpiring(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.query.groupId);
      if (!groupId || isNaN(groupId)) throw { statusCode: 400, message: 'Thiếu tham số groupId' };
      const data = await svc.getExpiring(groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  async add(req: any, res: Response, next: NextFunction) {
    try { 
      const data = await svc.addFood(req.body, req.user.id);
      return createSuccess(res, data, 'Thêm thực phẩm thành công', 201); 
    } catch (e) { next(e); }
  }

  async update(req: any, res: Response, next: NextFunction) {
    try { 
      const foodId = Number(req.params.id);
      await svc.updateFood(foodId, req.body, req.user.id); 
      return createSuccess(res, null, 'Cập nhật thành công'); 
    } catch (e) { next(e); }
  }

  async remove(req: any, res: Response, next: NextFunction) {
    try { 
      const foodId = Number(req.params.id);
      await svc.deleteFood(foodId, req.user.id); 
      return createSuccess(res, null, 'Xóa thành công'); 
    } catch (e) { next(e); }
  }

  async getLogs(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.query.groupId);
      if (!groupId || isNaN(groupId)) throw { statusCode: 400, message: 'Thiếu tham số groupId' };
      const data = await svc.getAuditLogs(groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }
}
