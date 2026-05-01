import sql from 'mssql';
import { env } from './env';

const config: sql.config = {
  server: env.DB_HOST || 'localhost',
  database: env.DB_NAME || 'shoppingdb',
  user: env.DB_USER || 'sa',
  password: env.DB_PASS,

  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: process.env.DB_INSTANCE || 'MSSQLSERVER01'
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export const getPool = (): Promise<sql.ConnectionPool> => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .catch(error => {
        poolPromise = null;
        throw error;
      });
  }
  return poolPromise;
};

export const connectDatabase = async (): Promise<sql.ConnectionPool> => {
  try {
    const pool = await getPool();
    console.log(`✅ Kết nối thành công tới SQL Server database: ${env.DB_NAME}`);
    return pool;
  } catch (error) {
    console.error('❌ Lỗi kết nối tới SQL Server:', error);
    throw error; // Bubble lên server.ts — KHÔNG gọi process.exit tại đây
  }
};

export default sql;