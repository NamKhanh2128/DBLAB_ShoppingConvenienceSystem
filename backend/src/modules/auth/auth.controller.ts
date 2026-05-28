import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { createSuccess, createError } from '../../core/utils/response';
import { verifyRefreshToken, generateAccessToken } from '../../core/utils/jwt';

const svc = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, rememberMe } = req.body;
      const result = await svc.login(email, password);
      
      const { refreshToken, ...tokenData } = result;

      // Thiết lập Cookie HttpOnly an toàn cho Refresh Token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 ngày hoặc 1 ngày
        path: '/api/v1/auth/refresh' // Chỉ gửi cookie này khi gọi đúng endpoint làm mới token
      });

      return createSuccess(res, tokenData, 'Đăng nhập thành công');
    } catch (e) { next(e); }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await svc.register(req.body);
      return createSuccess(res, result, 'Đăng ký thành công', 201);
    } catch (e) { next(e); }
  }

  async me(req: any, res: Response, next: NextFunction) {
    try {
      const user = await svc.getMe(req.user.id);
      return createSuccess(res, user);
    } catch (e) { next(e); }
  }

  async refresh(req: any, res: Response, next: NextFunction) {
    try {
      // Đọc cookie refreshToken từ custom parser
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return createError(res, 'Yêu cầu đăng nhập lại (Thiếu Refresh Token)', 401);
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded || !decoded.id) {
        res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
        return createError(res, 'Mã phiên làm mới không hợp lệ hoặc đã hết hạn', 401);
      }

      // Lấy thông tin user hiện tại
      const user = await svc.getMe(decoded.id);
      const pwdUpdatedAt = user.MatKhauNgayCapNhat ? new Date(user.MatKhauNgayCapNhat).getTime() : 0;

      // Cấp Access Token mới
      const newAccessToken = generateAccessToken({
        id: user.MaNguoiDung,
        role: user.VaiTro,
        pwdUpdatedAt
      });

      return createSuccess(res, { token: newAccessToken }, 'Làm mới token thành công');
    } catch (e) {
      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
      next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh'
      });
      return createSuccess(res, null, 'Đăng xuất thành công');
    } catch (e) { next(e); }
  }

  // ─── 2FA CONTROLLERS ───────────────────────────────────────────────────────
  
  async setup2FA(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const user = await svc.getMe(userId);
      const result = await svc.generate2FA(userId, user.Email);
      return createSuccess(res, result, 'Khởi tạo 2FA thành công');
    } catch (e) { next(e); }
  }

  async enable2FA(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      if (!code) return createError(res, 'Vui lòng cung cấp mã OTP 2FA', 400);

      const result = await svc.enable2FA(userId, code);
      return createSuccess(res, result, 'Bật bảo mật 2 lớp thành công');
    } catch (e) { next(e); }
  }

  async disable2FA(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await svc.disable2FA(userId);
      return createSuccess(res, result, 'Tắt bảo mật 2 lớp thành công');
    } catch (e) { next(e); }
  }
}
