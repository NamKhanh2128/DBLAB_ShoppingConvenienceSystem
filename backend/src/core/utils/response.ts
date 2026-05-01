import { Response } from 'express';

export const createSuccess = (res: Response, data: any = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const createError = (res: Response, message = 'Internal Server Error', statusCode = 500, errors: any = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export const sendPaginated = (res: Response, data: any, total: number, page: number, limit: number, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
};
