import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { createSuccess } from '../../core/utils/response';

const svc = new ReportsService();

export class ReportsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const groupId = Number(req.query.groupId);
      const data = await svc.getReports(groupId, userId);
      return createSuccess(res, data);
    } catch (e) {
      next(e);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const groupId = Number(req.query.groupId);
      
      // Nhận các tham số thống kê nâng cao
      const timezoneOffset = req.query.timezoneOffset !== undefined ? Number(req.query.timezoneOffset) : 0;
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

      const data = await svc.getSummary(groupId, userId, timezoneOffset, startDate, endDate);
      return createSuccess(res, data);
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const data = await svc.create(req.body, userId);
      return createSuccess(res, data, 'Tạo báo cáo thành công', 201);
    } catch (e) {
      next(e);
    }
  }
}
