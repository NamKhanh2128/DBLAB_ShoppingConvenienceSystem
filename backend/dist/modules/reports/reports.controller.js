"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const response_1 = require("../../core/utils/response");
const svc = new reports_service_1.ReportsService();
class ReportsController {
    async getAll(req, res, next) {
        try {
            const userId = req.user?.id;
            const groupId = Number(req.query.groupId);
            const data = await svc.getReports(groupId, userId);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async getSummary(req, res, next) {
        try {
            const userId = req.user?.id;
            const groupId = Number(req.query.groupId);
            // Nhận các tham số thống kê nâng cao
            const timezoneOffset = req.query.timezoneOffset !== undefined ? Number(req.query.timezoneOffset) : 0;
            const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
            const data = await svc.getSummary(groupId, userId, timezoneOffset, startDate, endDate);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async create(req, res, next) {
        try {
            const userId = req.user?.id;
            const data = await svc.create(req.body, userId);
            return (0, response_1.createSuccess)(res, data, 'Tạo báo cáo thành công', 201);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.ReportsController = ReportsController;
