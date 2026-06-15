"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
// 3. Middleware xác thực
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.createError)(res, 'Yêu cầu đăng nhập để truy cập', 401);
        }
        const token = authHeader.split(' ')[1];
        // Giải mã token
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || !decoded.id) {
            return (0, response_1.createError)(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
        }
        // Tự động nhận diện chạy ở localhost/127.0.0.1 để nới lỏng bảo mật khi chạy thử local
        const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
        if (!isLocalDev) {
            // [BẢO MẬT ADMIN] Enforce thời hạn tối đa 2 giờ cho tài khoản Admin/Moderator
            if (decoded.role === 'ADMIN' || decoded.role === 'MODERATOR') {
                const iat = decoded.iat || 0;
                const nowInSecs = Math.floor(Date.now() / 1000);
                if (nowInSecs - iat > 7200) { // 2 giờ
                    return (0, response_1.createError)(res, 'Phiên làm việc của Quản trị viên đã hết hạn (giới hạn tối đa 2 giờ để bảo mật). Vui lòng đăng nhập lại.', 401);
                }
            }
            // Kiểm tra chéo mật khẩu thay đổi gần nhất trong DB để vô hiệu hóa token cũ
            const pool = await (0, database_1.getPool)();
            const result = await pool.request()
                .input('userId', mssql_1.default.Int, decoded.id)
                .query('SELECT MatKhauNgayCapNhat FROM NguoiDung WHERE MaNguoiDung = @userId');
            const dbUser = result.recordset[0];
            if (!dbUser) {
                return (0, response_1.createError)(res, 'Người dùng không tồn tại trên hệ thống', 401);
            }
            const dbPwdTime = dbUser.MatKhauNgayCapNhat ? new Date(dbUser.MatKhauNgayCapNhat).getTime() : 0;
            const tokenPwdTime = decoded.pwdUpdatedAt || 0;
            // Nếu mật khẩu thực tế trong DB đã được cập nhật SAU thời điểm cấp token (cho sai số 1 giây)
            if (dbPwdTime > tokenPwdTime + 1000) {
                return (0, response_1.createError)(res, 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.', 401);
            }
        }
        // Gán biến user hợp lệ
        req.user = decoded;
        next();
    }
    catch (error) {
        return (0, response_1.createError)(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
    }
};
exports.authenticate = authenticate;
