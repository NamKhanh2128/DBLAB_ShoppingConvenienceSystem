import { Request, Response, NextFunction } from 'express';
import { ShoppingService } from './shopping.service';
import { createSuccess } from '../../core/utils/response';

const svc = new ShoppingService();

export class ShoppingController {
  // Lists
  async getLists(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getLists(Number(req.query.groupId))); } catch (e) { next(e); }
  }
  async createList(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.createList(req.body.maNhom, req.body.ghiChu), 'Tạo danh sách thành công', 201); } catch (e) { next(e); }
  }
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try { await svc.updateStatus(Number(req.params.id), req.body.trangThai); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async deleteList(req: Request, res: Response, next: NextFunction) {
    try { await svc.deleteList(Number(req.params.id)); return createSuccess(res, null, 'Xóa thành công'); } catch (e) { next(e); }
  }

  // Items
  async getItems(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getItems(Number(req.params.id))); } catch (e) { next(e); }
  }
  async addItem(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.addItem(Number(req.params.id), req.body), 'Thêm món thành công', 201); } catch (e) { next(e); }
  }
  async toggleItem(req: Request, res: Response, next: NextFunction) {
    try { await svc.toggleItem(Number(req.params.itemId), req.body.done); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async updateItem(req: Request, res: Response, next: NextFunction) {
    try { await svc.updateItem(Number(req.params.itemId), req.body); return createSuccess(res, null, 'Cập nhật thành công'); } catch (e) { next(e); }
  }
  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try { await svc.deleteItem(Number(req.params.itemId)); return createSuccess(res, null, 'Xóa thành công'); } catch (e) { next(e); }
  }
}
