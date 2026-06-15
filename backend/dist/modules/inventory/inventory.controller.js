"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("./inventory.service");
const response_1 = require("../../core/utils/response");
const svc = new inventory_service_1.InventoryService();
class InventoryController {
    async getAll(req, res, next) {
        try {
            let groupId = Number(req.query.groupId);
            if ((!groupId || isNaN(groupId)) && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
                groupId = 1;
            }
            const data = await svc.getInventory(groupId, req.user.id);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async getExpiring(req, res, next) {
        try {
            let groupId = Number(req.query.groupId);
            if ((!groupId || isNaN(groupId)) && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
                groupId = 1;
            }
            const data = await svc.getExpiring(groupId, req.user.id);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async add(req, res, next) {
        try {
            const data = await svc.addFood(req.body, req.user.id);
            return (0, response_1.createSuccess)(res, data, 'Thêm thực phẩm thành công', 201);
        }
        catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            const foodId = Number(req.params.id);
            await svc.updateFood(foodId, req.body, req.user.id);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async remove(req, res, next) {
        try {
            const foodId = Number(req.params.id);
            await svc.deleteFood(foodId, req.user.id);
            return (0, response_1.createSuccess)(res, null, 'Xóa thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async getLogs(req, res, next) {
        try {
            let groupId = Number(req.params.groupId);
            if ((!groupId || isNaN(groupId)) && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
                groupId = 1;
            }
            const data = await svc.getAuditLogs(groupId, req.user.id);
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.InventoryController = InventoryController;
