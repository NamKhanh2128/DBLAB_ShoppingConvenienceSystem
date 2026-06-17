import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../core/middleware/validate.middleware';
import { authenticate } from '../../core/middleware/auth.middleware';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

// Custom in-memory Rate Limiter để chống Brute Force và Spam
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  const requests: Record<string, { count: number; resetTime: number }> = {};
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requests[ip] || now > requests[ip].resetTime) {
      requests[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    requests[ip].count += 1;
    if (requests[ip].count > max) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};

const loginLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Tài khoản của bạn đã thử đăng nhập sai quá 5 lần. Vui lòng quay lại sau 15 phút.');

// Public routes
router.post('/login', loginLimiter, validateRequest(loginSchema), authController.login.bind(authController));
router.post('/register', validateRequest(registerSchema), authController.register.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));

// 2FA Protected routes
router.post('/2fa/setup', authenticate, authController.setup2FA.bind(authController));
router.post('/2fa/enable', authenticate, authController.enable2FA.bind(authController));
router.post('/2fa/disable', authenticate, authController.disable2FA.bind(authController));

export default router;
