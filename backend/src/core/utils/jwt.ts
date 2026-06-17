import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m', // Access Token hết hạn sau 15 phút
  });
};

export const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, env.JWT_SECRET + '_refresh', {
    expiresIn: '7d', // Refresh Token hết hạn sau 7 ngày
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, env.JWT_SECRET + '_refresh');
  } catch (error) {
    return null;
  }
};
