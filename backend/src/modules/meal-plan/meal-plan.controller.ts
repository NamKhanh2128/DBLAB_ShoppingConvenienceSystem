import { Response, NextFunction } from 'express';
import { MealPlanService } from './meal-plan.service';
import { createSuccess } from '../../core/utils/response';

const svc = new MealPlanService();

export class MealPlanController {
  
  async getByDateRange(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.query.groupId);
      const start = String(req.query.start);
      const end = String(req.query.end);
      const data = await svc.getByDateRange(groupId, start, end, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  async getToday(req: any, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.query.groupId);
      const clientDate = req.query.clientDate ? String(req.query.clientDate) : undefined;
      const data = await svc.getToday(groupId, clientDate, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  async create(req: any, res: Response, next: NextFunction) {
    try {
      const data = await svc.create(req.body, req.user.id);
      return createSuccess(res, data, 'Lên kế hoạch bữa ăn thành công', 201);
    } catch (e) { next(e); }
  }

  async update(req: any, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await svc.update(id, req.body, req.user.id);
      return createSuccess(res, null, 'Cập nhật kế hoạch thành công');
    } catch (e) { next(e); }
  }

  async remove(req: any, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await svc.remove(id, req.user.id);
      return createSuccess(res, null, 'Xóa kế hoạch thành công');
    } catch (e) { next(e); }
  }

  async checkIngredients(req: any, res: Response, next: NextFunction) {
    try {
      const maMon = Number(req.query.maMon);
      const soKhauPhan = Number(req.query.soKhauPhan || 4);
      const groupId = Number(req.query.groupId);
      
      const data = await svc.checkIngredientsSufficiency(maMon, soKhauPhan, groupId, req.user.id);
      return createSuccess(res, data);
    } catch (e) { next(e); }
  }

  async addMissingToShopping(req: any, res: Response, next: NextFunction) {
    try {
      const { maMon, soKhauPhan, groupId } = req.body;
      if (!maMon || !groupId) {
        throw { statusCode: 400, message: 'Thiếu thông tin món ăn hoặc nhóm gia đình' };
      }
      
      const data = await svc.autoAddMissingToShoppingList(Number(maMon), Number(soKhauPhan || 4), Number(groupId), req.user.id);
      return createSuccess(res, data, data.message);
    } catch (e) { next(e); }
  }

  async copyRange(req: any, res: Response, next: NextFunction) {
    try {
      const { groupId, fromStart, fromEnd, toStart } = req.body;
      if (!groupId || !fromStart || !fromEnd || !toStart) {
        throw { statusCode: 400, message: 'Thiếu thông tin khoảng thời gian để sao chép thực đơn' };
      }
      
      await svc.copyMealPlanRange(Number(groupId), String(fromStart), String(fromEnd), String(toStart), req.user.id);
      return createSuccess(res, null, 'Sao chép thực đơn thành công');
    } catch (e) { next(e); }
  }
}
