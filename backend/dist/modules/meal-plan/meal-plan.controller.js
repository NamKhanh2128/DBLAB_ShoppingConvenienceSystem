"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealPlanController = void 0;
const meal_plan_service_1 = require("./meal-plan.service");
const response_1 = require("../../core/utils/response");
const svc = new meal_plan_service_1.MealPlanService();
class MealPlanController {
    async getByDateRange(req, res, next) {
        try {
            const groupId = Number(req.query.groupId);
            const start = String(req.query.start);
            const end = String(req.query.end);
            const data = await svc.getByDateRange(groupId, start, end, req.user.id);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async getToday(req, res, next) {
        try {
            const groupId = Number(req.query.groupId);
            const clientDate = req.query.clientDate ? String(req.query.clientDate) : undefined;
            const data = await svc.getToday(groupId, clientDate, req.user.id);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async create(req, res, next) {
        try {
            const data = await svc.create(req.body, req.user.id);
            return (0, response_1.createSuccess)(res, data, 'Lên kế hoạch bữa ăn thành công', 201);
        }
        catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            await svc.update(id, req.body, req.user.id);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật kế hoạch thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async remove(req, res, next) {
        try {
            const id = Number(req.params.id);
            await svc.remove(id, req.user.id);
            return (0, response_1.createSuccess)(res, null, 'Xóa kế hoạch thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async checkIngredients(req, res, next) {
        try {
            const maMon = Number(req.query.maMon);
            const soKhauPhan = Number(req.query.soKhauPhan || 4);
            const groupId = Number(req.query.groupId);
            const data = await svc.checkIngredientsSufficiency(maMon, soKhauPhan, groupId, req.user.id);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async addMissingToShopping(req, res, next) {
        try {
            const { maMon, soKhauPhan, groupId } = req.body;
            if (!maMon || !groupId) {
                throw { statusCode: 400, message: 'Thiếu thông tin món ăn hoặc nhóm gia đình' };
            }
            const data = await svc.autoAddMissingToShoppingList(Number(maMon), Number(soKhauPhan || 4), Number(groupId), req.user.id);
            return (0, response_1.createSuccess)(res, data, data.message);
        }
        catch (e) {
            next(e);
        }
    }
    async copyRange(req, res, next) {
        try {
            const { groupId, fromStart, fromEnd, toStart } = req.body;
            if (!groupId || !fromStart || !fromEnd || !toStart) {
                throw { statusCode: 400, message: 'Thiếu thông tin khoảng thời gian để sao chép thực đơn' };
            }
            await svc.copyMealPlanRange(Number(groupId), String(fromStart), String(fromEnd), String(toStart), req.user.id);
            return (0, response_1.createSuccess)(res, null, 'Sao chép thực đơn thành công');
        }
        catch (e) {
            next(e);
        }
    }
}
exports.MealPlanController = MealPlanController;
