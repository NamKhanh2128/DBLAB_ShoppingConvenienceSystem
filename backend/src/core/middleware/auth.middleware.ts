import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { createError } from '../utils/response';

// 1. Định nghĩa chính xác cấu trúc dữ liệu giấu trong Token (Không dùng any)
export interface JwtPayload {
  id: number; // Đổi thành string nếu ID trong database NguoiDung của bạn là UUID
  email?: string;
  role?: string;
}

// 2. Kế thừa Request từ Express, KHÔNG dùng dấu "?" để đảm bảo Controller gọi là có data
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// 3. Middleware xác thực
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Giải mã token và ép kiểu nó về đúng định dạng JwtPayload đã khai báo ở trên
    const decoded = verifyToken(token) as JwtPayload;

    if (!decoded || !decoded.id) {
      return createError(res, 'Invalid or expired token', 401);
    }

    // Ép kiểu req sang AuthenticatedRequest để gán biến user một cách hợp lệ
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error) {
    // Bắt lỗi khi token bị hết hạn (jwt expired) hoặc sai chữ ký
    return createError(res, 'Invalid or expired token', 401);
  }
};