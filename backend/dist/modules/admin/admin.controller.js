"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../core/utils/response");
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
const svc = new admin_service_1.AdminService();
class AdminController {
    async getActor(req) {
        const user = req.user;
        const userId = Number(user?.id || 0);
        const userRole = String(user?.role || 'USER');
        const ip = String(req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');
        let name = 'Admin';
        if (userId) {
            const pool = await (0, database_1.getPool)();
            const result = await pool.request()
                .input('id', mssql_1.default.Int, userId)
                .query('SELECT HoTen FROM NguoiDung WHERE MaNguoiDung = @id');
            name = result.recordset[0]?.HoTen || 'Admin';
        }
        return { id: userId, name, role: userRole, ip };
    }
    async getDashboard(req, res, next) {
        try {
            return (0, response_1.createSuccess)(res, await svc.getDashboard());
        }
        catch (e) {
            next(e);
        }
    }
    async getUsers(req, res, next) {
        try {
            return (0, response_1.createSuccess)(res, await svc.getUsers());
        }
        catch (e) {
            next(e);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const actor = await this.getActor(req);
            await svc.updateUserStatus(Number(req.params.id), req.body.status, actor);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật trạng thái thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async updateRole(req, res, next) {
        try {
            const actor = await this.getActor(req);
            await svc.updateUserRole(Number(req.params.id), req.body.role, actor);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật vai trò thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const actor = await this.getActor(req);
            await svc.deleteUser(Number(req.params.id), actor);
            return (0, response_1.createSuccess)(res, null, 'Xóa người dùng thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async getAuditLogs(req, res, next) {
        try {
            const data = await svc.getAuditLogs();
            return (0, response_1.createSuccess)(res, data);
        }
        catch (e) {
            next(e);
        }
    }
    async cleanupFakeUsers(req, res, next) {
        try {
            const actor = await this.getActor(req);
            const result = await svc.cleanupFakeAccounts(actor);
            return (0, response_1.createSuccess)(res, result, `Đã dọn dẹp xong ${result.cleanedCount} tài khoản ảo.`);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.AdminController = AdminController;
