import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { createError } from '../utils/response';

export const authorizeRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return createError(res, 'Forbidden: Insufficient permissions', 403);
    }
    next();
  };
};
