"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const response_1 = require("../../core/utils/response");
const svc = new users_service_1.UsersService();
class UsersController {
    // ─── GET ALL (Admin) ───────────────────────────────────────────────────────
    async getAll(req, res, next) {
        try {
            return (0, response_1.createSuccess)(res, await svc.getAll());
        }
        catch (e) {
            next(e);
        }
    }
    // ─── GET ONE (Admin) ───────────────────────────────────────────────────────
    async getOne(req, res, next) {
        try {
            return (0, response_1.createSuccess)(res, await svc.getById(Number(req.params.id)));
        }
        catch (e) {
            next(e);
        }
    }
    // ─── UPDATE PROFILE (Self-service) ────────────────────────────────────────
    // Endpoint: PUT /api/v1/users/profile
    // Body mong đợi: { hoTen?, email?, soDienThoai?, bio? }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
            }
            // Chỉ lấy đúng các field được phép update, tránh mass assignment
            const dto = {
                hoTen: req.body.hoTen,
                email: req.body.email,
                soDienThoai: req.body.soDienThoai,
                bio: req.body.bio,
            };
            const updatedUser = await svc.updateProfile(userId, dto);
            return (0, response_1.createSuccess)(res, updatedUser, 'Cập nhật hồ sơ thành công');
        }
        catch (e) {
            next(e);
        }
    }
    // ─── CHANGE PASSWORD (Self-service) ───────────────────────────────────────
    // Endpoint: PUT /api/v1/users/change-password
    // Body mong đợi: { currentPassword, newPassword }
    async changePassword(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
            }
            const dto = {
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
            };
            const result = await svc.changePassword(userId, dto);
            return (0, response_1.createSuccess)(res, result, result.message);
        }
        catch (e) {
            next(e);
        }
    }
    // ─── ADMIN ACTIONS ─────────────────────────────────────────────────────────
    async updateRole(req, res, next) {
        try {
            const updated = await svc.updateRole(Number(req.params.id), req.body.role);
            return (0, response_1.createSuccess)(res, updated, 'Cập nhật vai trò thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const updated = await svc.updateStatus(Number(req.params.id), req.body.status);
            return (0, response_1.createSuccess)(res, updated, 'Cập nhật trạng thái thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async deleteUser(req, res, next) {
        try {
            await svc.deleteUser(Number(req.params.id));
            return (0, response_1.createSuccess)(res, null, 'Xóa thành công');
        }
        catch (e) {
            next(e);
        }
    }
    async getStats(req, res, next) {
        try {
            return (0, response_1.createSuccess)(res, await svc.getStats());
        }
        catch (e) {
            next(e);
        }
    }
}
exports.UsersController = UsersController;
