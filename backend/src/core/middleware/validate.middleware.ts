import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { createError } from '../utils/response';

export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error && error.errors) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return createError(res, 'Validation failed', 400, errors);
      }
      next(error);
    }
  };
};
