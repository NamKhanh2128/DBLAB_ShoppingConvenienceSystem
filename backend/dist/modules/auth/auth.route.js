"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Custom in-memory Rate Limiter để chống Brute Force và Spam
const createRateLimiter = (windowMs, max, message) => {
    const requests = {};
    return (req, res, next) => {
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
const registerLimiter = createRateLimiter(60 * 60 * 1000, 3, 'Bạn đã đăng ký quá nhiều tài khoản trong thời gian ngắn. Vui lòng quay lại sau 1 giờ.');
// Public routes
router.post('/login', loginLimiter, (0, validate_middleware_1.validateRequest)(auth_validation_1.loginSchema), authController.login.bind(authController));
router.post('/register', registerLimiter, (0, validate_middleware_1.validateRequest)(auth_validation_1.registerSchema), authController.register.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));
// Protected routes
router.get('/me', auth_middleware_1.authenticate, authController.me.bind(authController));
// 2FA Protected routes
router.post('/2fa/setup', auth_middleware_1.authenticate, authController.setup2FA.bind(authController));
router.post('/2fa/enable', auth_middleware_1.authenticate, authController.enable2FA.bind(authController));
router.post('/2fa/disable', auth_middleware_1.authenticate, authController.disable2FA.bind(authController));
exports.default = router;
