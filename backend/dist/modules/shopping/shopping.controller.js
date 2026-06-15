"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingController = void 0;
const shopping_service_1 = require("./shopping.service");
const response_1 = require("../../core/utils/response");
const svc = new shopping_service_1.ShoppingService();
class ShoppingController {
    // ── Lists ────────────────────────────────────────────────────────
    /**
     * GET /shopping/lists?groupId=X
     */
    async getLists(req, res, next) {
        try {
            const userId = req.user?.id;
            const groupId = Number(req.query.groupId);
            if (!groupId)
                return res.status(400).json({ success: false, message: 'Thiếu groupId' });
            return (0, response_1.createSuccess)(res, await svc.getLists(groupId, userId));
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * POST /shopping/lists
     * Body: { maNhom, ghiChu? }
     */
    async createList(req, res, next) {
        try {
            const userId = req.user?.id;
            return (0, response_1.createSuccess)(res, await svc.createList(req.body, userId), 'Tạo danh sách thành công', 201);
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * PATCH /shopping/lists/:id/status
     * Body: { trangThai }
     */
    async updateStatus(req, res, next) {
        try {
            const userId = req.user?.id;
            await svc.updateStatus(Number(req.params.id), req.body.trangThai, userId);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật trạng thái thành công');
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * DELETE /shopping/lists/:id
     */
    async deleteList(req, res, next) {
        try {
            const userId = req.user?.id;
            await svc.deleteList(Number(req.params.id), userId);
            return (0, response_1.createSuccess)(res, null, 'Xóa danh sách thành công');
        }
        catch (e) {
            next(e);
        }
    }
    // ── Items ────────────────────────────────────────────────────────
    /**
     * GET /shopping/lists/:id/items
     */
    async getItems(req, res, next) {
        try {
            const userId = req.user?.id;
            return (0, response_1.createSuccess)(res, await svc.getItems(Number(req.params.id), userId));
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * POST /shopping/lists/:id/items
     * Body: { tenThucPham, soLuong, donVi?, giaDuKien?, danhMucHang? }
     *
     * Auto-merge: nếu trùng tên+đơn vị → cộng số lượng, không tạo dòng mới.
     * Response trả về { merged: true } nếu đã gom nhóm.
     */
    async addItem(req, res, next) {
        try {
            const userId = req.user?.id;
            const result = await svc.addItem(Number(req.params.id), req.body, userId);
            const msg = result.merged ? result.message : 'Thêm món thành công';
            return (0, response_1.createSuccess)(res, result, msg, 201);
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * PATCH /shopping/items/:itemId/toggle
     * Body: { done: boolean }
     */
    async toggleItem(req, res, next) {
        try {
            const userId = req.user?.id;
            await svc.toggleItem(Number(req.params.itemId), req.body.done, userId);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật thành công');
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * PUT /shopping/items/:itemId
     */
    async updateItem(req, res, next) {
        try {
            const userId = req.user?.id;
            await svc.updateItem(Number(req.params.itemId), req.body, userId);
            return (0, response_1.createSuccess)(res, null, 'Cập nhật thành công');
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * DELETE /shopping/items/:itemId
     */
    async deleteItem(req, res, next) {
        try {
            const userId = req.user?.id;
            await svc.deleteItem(Number(req.params.itemId), userId);
            return (0, response_1.createSuccess)(res, null, 'Xóa thành công');
        }
        catch (e) {
            next(e);
        }
    }
    // ── Special Operations ───────────────────────────────────────────
    /**
     * POST /shopping/lists/:id/complete-and-restock
     * Hoàn thành mua sắm + tự động nhập toàn bộ items đã mua vào kho.
     */
    async completeAndRestock(req, res, next) {
        try {
            const userId = req.user?.id;
            const result = await svc.completeAndRestock(Number(req.params.id), userId);
            return (0, response_1.createSuccess)(res, result, result.message);
        }
        catch (e) {
            next(e);
        }
    }
    /**
     * POST /shopping/lists/:id/merge-duplicates
     * Gom nhóm tất cả items trùng tên+đơn vị trong danh sách.
     */
    async mergeDuplicates(req, res, next) {
        try {
            const userId = req.user?.id;
            const result = await svc.mergeAllDuplicates(Number(req.params.id), userId);
            return (0, response_1.createSuccess)(res, result, result.message);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.ShoppingController = ShoppingController;
