"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const inventory_repository_1 = require("./inventory.repository");
const family_repository_1 = require("../family/family.repository");
const inventory_validation_1 = require("./inventory.validation");
class InventoryService {
    repo = new inventory_repository_1.InventoryRepository();
    familyRepo = new family_repository_1.FamilyRepository();
    /**
     * Helper kiểm tra chéo quyền hạn thành viên trong nhóm gia đình.
     */
    async checkGroupMembership(groupId, userId) {
        if (!groupId) {
            throw { statusCode: 400, message: 'Thiếu mã nhóm gia đình' };
        }
        const member = await this.familyRepo.isMember(groupId, userId);
        if (!member) {
            throw { statusCode: 403, message: 'Bạn không có quyền truy cập thông tin của gia đình này' };
        }
    }
    async getInventory(groupId, userId) {
        await this.checkGroupMembership(groupId, userId);
        return this.repo.getByGroup(groupId);
    }
    async getExpiring(groupId, userId, days = 3) {
        await this.checkGroupMembership(groupId, userId);
        return this.repo.getExpiring(groupId, days);
    }
    async addFood(data, creatorId) {
        // Tự động gán mã nhóm mặc định là 1 nếu maNhom bị null/không hợp lệ khi chạy ở localhost
        if ((data.maNhom === null || data.maNhom === undefined || isNaN(Number(data.maNhom))) &&
            (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
            data.maNhom = 1;
        }
        // Validate dữ liệu đầu vào bằng Zod
        const validatedData = inventory_validation_1.addFoodSchema.parse(data);
        // Kiểm tra bảo mật IDOR
        await this.checkGroupMembership(validatedData.maNhom, creatorId);
        const id = await this.repo.add(validatedData, creatorId);
        return { MaTP: id, ...validatedData };
    }
    async updateFood(id, data, updaterId) {
        // Validate dữ liệu đầu vào bằng Zod
        const validatedData = inventory_validation_1.updateFoodSchema.parse(data);
        // Lấy thông tin hiện tại trong kho
        const existing = await this.repo.getById(id);
        if (!existing) {
            throw { statusCode: 404, message: 'Không tìm thấy thực phẩm này trong kho' };
        }
        // Kiểm tra chéo phân quyền IDOR
        await this.checkGroupMembership(existing.MaNhom, updaterId);
        // Thực hiện cập nhật an toàn kiểm soát xung đột OCC
        const success = await this.repo.update(id, validatedData, updaterId, existing);
        if (!success) {
            throw {
                statusCode: 409,
                message: 'Vật phẩm đã được cập nhật bởi một thành viên khác trong gia đình. Vui lòng tải lại trang.'
            };
        }
    }
    async deleteFood(id, deleterId) {
        // Lấy thông tin hiện tại trong kho
        const existing = await this.repo.getById(id);
        if (!existing) {
            throw { statusCode: 404, message: 'Không tìm thấy thực phẩm này trong kho' };
        }
        // Kiểm tra chéo phân quyền IDOR
        await this.checkGroupMembership(existing.MaNhom, deleterId);
        await this.repo.remove(id, deleterId, existing);
    }
    async getAuditLogs(groupId, userId) {
        await this.checkGroupMembership(groupId, userId);
        return this.repo.getAuditLogs(groupId);
    }
    async getCount(groupId, userId) {
        await this.checkGroupMembership(groupId, userId);
        return this.repo.countByGroup(groupId);
    }
}
exports.InventoryService = InventoryService;
