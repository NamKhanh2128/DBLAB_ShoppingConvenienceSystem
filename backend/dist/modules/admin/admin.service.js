"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_repository_1 = require("./admin.repository");
class AdminService {
    repo = new admin_repository_1.AdminRepository();
    async getDashboard() {
        return this.repo.getDashboardStats();
    }
    async getUsers() {
        return this.repo.getAllUsers();
    }
    async updateUserStatus(id, status, actor) {
        // [CHỐNG TỰ SÁT QUYỀN LỰC] Admin không thể tự khóa tài khoản của chính mình
        if (id === actor.id) {
            await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật trạng thái', 'user', 'error', `Thất bại: Tự thay đổi trạng thái bản thân sang ${status}`, actor.ip);
            throw { statusCode: 400, message: 'Bạn không thể tự khóa hoặc thay đổi trạng thái tài khoản của chính mình' };
        }
        await this.repo.updateUserStatus(id, status);
        await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật trạng thái', 'user', 'success', `Đã cập nhật trạng thái của người dùng ID ${id} sang ${status}`, actor.ip);
    }
    async updateUserRole(id, role, actor) {
        // [CHỐNG TỰ SÁT QUYỀN LỰC] Admin không thể tự hạ quyền của chính mình
        if (id === actor.id) {
            await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật vai trò', 'user', 'error', `Thất bại: Tự thay đổi vai trò bản thân sang ${role}`, actor.ip);
            throw { statusCode: 400, message: 'Bạn không thể tự hạ vai trò hoặc thay đổi quyền hạn của chính mình' };
        }
        await this.repo.updateUserRole(id, role);
        await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật vai trò', 'user', 'success', `Đã cập nhật vai trò của người dùng ID ${id} sang ${role}`, actor.ip);
    }
    async deleteUser(id, actor) {
        if (id === actor.id) {
            await this.repo.addAuditLog(actor.id, actor.name, 'Xóa người dùng', 'user', 'error', 'Thất bại: Tự xóa tài khoản bản thân', actor.ip);
            throw { statusCode: 400, message: 'Bạn không thể tự xóa tài khoản của chính mình' };
        }
        await this.repo.deleteUser(id);
        await this.repo.addAuditLog(actor.id, actor.name, 'Xóa người dùng', 'user', 'warning', `Đã thực hiện xóa mềm người dùng ID ${id}`, actor.ip);
    }
    async getAuditLogs() {
        return this.repo.getAuditLogs();
    }
    async cleanupFakeAccounts(actor) {
        const cleanedCount = await this.repo.cleanupFakeAccounts();
        await this.repo.addAuditLog(actor.id, actor.name, 'Dọn dẹp tài khoản ảo', 'data', cleanedCount > 0 ? 'success' : 'warning', `Đã dọn dẹp hàng loạt ${cleanedCount} tài khoản ảo đăng ký trong 24 giờ qua`, actor.ip);
        return { cleanedCount };
    }
}
exports.AdminService = AdminService;
