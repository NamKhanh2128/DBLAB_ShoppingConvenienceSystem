import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../core/middleware/validate.middleware';
import { authenticate } from '../../core/middleware/auth.middleware';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', validateRequest(loginSchema), authController.login.bind(authController));
router.post('/register', validateRequest(registerSchema), authController.register.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
