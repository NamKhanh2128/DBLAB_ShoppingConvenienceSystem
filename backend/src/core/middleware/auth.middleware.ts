import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { createError } from '../utils/response';
import { getPool } from '../../config/database';
import sql from 'mssql';

// 1. Định nghĩa chính xác cấu trúc dữ liệu giấu trong Token (Không dùng any)
export interface JwtPayload {
  id: number;
  email?: string;
  role?: string;
  pwdUpdatedAt?: number; // Timestamp tại thời điểm phát hành token
}

// 2. Kế thừa Request từ Express
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// 3. Middleware xác thực
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createError(res, 'Yêu cầu đăng nhập để truy cập', 401);
    }

    const token = authHeader.split(' ')[1];

    // Giải mã token
    const decoded = verifyToken(token) as JwtPayload;

    if (!decoded || !decoded.id) {
      return createError(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
    }

    // [BẢO MẬT ADMIN] Enforce thời hạn tối đa 2 giờ cho tài khoản Admin/Moderator
    if (decoded.role === 'ADMIN' || decoded.role === 'MODERATOR') {
      const iat = (decoded as any).iat || 0;
      const nowInSecs = Math.floor(Date.now() / 1000);
      if (nowInSecs - iat > 7200) { // 2 giờ
        return createError(res, 'Phiên làm việc của Quản trị viên đã hết hạn (giới hạn tối đa 2 giờ để bảo mật). Vui lòng đăng nhập lại.', 401);
      }
    }

    // Kiểm tra chéo mật khẩu thay đổi gần nhất trong DB để vô hiệu hóa token cũ
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, decoded.id)
      .query('SELECT MatKhauNgayCapNhat FROM NguoiDung WHERE MaNguoiDung = @userId');

    const dbUser = result.recordset[0];
    if (!dbUser) {
      return createError(res, 'Người dùng không tồn tại trên hệ thống', 401);
    }

    const dbPwdTime = dbUser.MatKhauNgayCapNhat ? new Date(dbUser.MatKhauNgayCapNhat).getTime() : 0;
    const tokenPwdTime = decoded.pwdUpdatedAt || 0;

    // Nếu mật khẩu thực tế trong DB đã được cập nhật SAU thời điểm cấp token (cho sai số 1 giây)
    if (dbPwdTime > tokenPwdTime + 1000) {
      return createError(res, 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.', 401);
    }

    // Gán biến user hợp lệ
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error) {
    return createError(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
  }
};