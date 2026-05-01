import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { createSuccess } from '../../core/utils/response';

const svc = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await svc.login(req.body.email, req.body.password);
      return createSuccess(res, result, 'Đăng nhập thành công');
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
}
