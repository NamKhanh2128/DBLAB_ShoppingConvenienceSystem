import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: Number(process.env.SERVER_PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // SQL Server
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'sa',
  DB_PASS: process.env.DB_PASS || '',
  DB_NAME: process.env.DB_NAME || 'shoppingdb',
  DB_PORT: Number(process.env.DB_PORT || 1433),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRE || '24h',
};
