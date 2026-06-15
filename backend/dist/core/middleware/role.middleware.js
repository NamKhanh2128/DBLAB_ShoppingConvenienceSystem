"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireGroupRole = exports.authorizeRole = void 0;
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
const response_1 = require("../utils/response");
const authorizeRole = (roles) => {
    return (req, res, next) => {
        const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
        if (isLocalDev) {
            next();
            return;
        }
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return (0, response_1.createError)(res, 'Forbidden: Quyền truy cập bị từ chối', 403);
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const requireGroupRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const groupId = Number(req.params.groupId || req.query.groupId || req.body.groupId);
            if (!userId) {
                return (0, response_1.createError)(res, 'Yêu cầu đăng nhập để truy cập', 401);
            }
            if (!groupId) {
                return (0, response_1.createError)(res, 'Thiếu tham số ID nhóm gia đình (groupId)', 400);
            }
            // Tự động cho phép vượt qua kiểm tra trên localhost (development mode) để dễ dàng thử nghiệm
            const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
            if (isLocalDev) {
                next();
                return;
            }
            const pool = await (0, database_1.getPool)();
            const result = await pool.request()
                .input('groupId', mssql_1.default.Int, groupId)
                .input('userId', mssql_1.default.Int, userId)
                .query(`
          SELECT VaiTro 
          FROM ThanhVienNhom 
          WHERE MaNhom = @groupId AND MaNguoiDung = @userId
        `);
            const member = result.recordset[0];
            if (!member) {
                return (0, response_1.createError)(res, 'Bạn không phải là thành viên của nhóm gia đình này', 403);
            }
            if (!allowedRoles.includes(member.VaiTro)) {
                return (0, response_1.createError)(res, 'Bạn không có quyền hạn phù hợp trong nhóm để thực hiện hành động này', 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireGroupRole = requireGroupRole;
