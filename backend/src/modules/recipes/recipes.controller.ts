import { Request, Response, NextFunction } from 'express';
import { RecipesService } from './recipes.service';
import { createSuccess } from '../../core/utils/response';

const svc = new RecipesService();

export class RecipesController {
  /**
   * GET /recipes?groupId=X
   * Lấy tất cả công thức: system recipes + recipes riêng của nhóm.
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
      return createSuccess(res, await svc.getAll(userId, groupId));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /recipes/:id?groupId=X
   * Lấy chi tiết một công thức kèm nguyên liệu.
   */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
      return createSuccess(res, await svc.getById(Number(req.params.id), userId, groupId));
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /recipes
   * Body: { tenMon, congThuc, huongDan, thoiGian, khauPhan, doKho, danhMuc, moTa, maNhom }
   * Tạo công thức mới gắn với nhóm gia đình.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const groupId = Number(req.body.maNhom);
      if (!groupId) {
        return res.status(400).json({ success: false, message: 'Thiếu maNhom trong body' });
      }
      return createSuccess(res, await svc.create(req.body, userId, groupId), 'Tạo công thức thành công', 201);
    } catch (e) {
      next(e);
    }
  }

  /**
   * PUT /recipes/:id
   * Cập nhật công thức (chỉ thành viên cùng nhóm).
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      await svc.update(Number(req.params.id), req.body, userId);
      return createSuccess(res, null, 'Cập nhật công thức thành công');
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /recipes/:id
   * Xóa công thức (chỉ thành viên cùng nhóm, không xóa được System Recipe).
   */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      await svc.remove(Number(req.params.id), userId);
      return createSuccess(res, null, 'Xóa công thức thành công');
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /recipes/:id/cook
   * Body: { soKhauPhan: number, maNhom: number }
   * Đánh dấu "Đã nấu" → tự động trừ nguyên liệu trong kho.
   */
  async cook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await svc.cookRecipe(Number(req.params.id), req.body, userId);
      return createSuccess(res, result, result.message);
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /recipes/suggest?groupId=X
   * Gợi ý công thức dựa trên nguyên liệu có sẵn trong kho của nhóm.
   */
  async suggest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const groupId = Number(req.query.groupId);
      if (!groupId) {
        return res.status(400).json({ success: false, message: 'Thiếu groupId' });
      }
      return createSuccess(res, await svc.getSuggested(userId, groupId));
    } catch (e) {
      next(e);
    }
  }
}
