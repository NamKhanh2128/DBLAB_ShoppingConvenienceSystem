import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { createSuccess } from '../../core/utils/response';

const svc = new ReportsService();

export class ReportsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getReports(Number(req.query.groupId))); } catch (e) { next(e); }
  }
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.getSummary(Number(req.query.groupId))); } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try { return createSuccess(res, await svc.create(req.body), 'Tạo báo cáo thành công', 201); } catch (e) { next(e); }
  }
}
