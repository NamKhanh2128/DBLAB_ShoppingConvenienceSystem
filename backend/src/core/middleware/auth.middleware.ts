import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { createError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return createError(res, 'Invalid or expired token', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
