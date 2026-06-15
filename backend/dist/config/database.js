"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.getPool = void 0;
const mssql_1 = __importDefault(require("mssql"));
const env_1 = require("./env");
const config = {
    server: env_1.env.DB_HOST || 'localhost',
    database: env_1.env.DB_NAME || 'shoppingdb',
    user: env_1.env.DB_USER || 'sa',
    password: env_1.env.DB_PASS,
    port: env_1.env.DB_PORT || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        // Only set instanceName if explicitly provided; using port + instanceName together causes ECONNREFUSED
        ...(process.env.DB_INSTANCE ? { instanceName: process.env.DB_INSTANCE } : {}),
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    connectionTimeout: 15000,
    requestTimeout: 30000,
};
let poolPromise = null;
const getPool = () => {
    if (!poolPromise) {
        poolPromise = new mssql_1.default.ConnectionPool(config)
            .connect()
            .catch(error => {
            poolPromise = null;
            throw error;
        });
    }
    return poolPromise;
};
exports.getPool = getPool;
const connectDatabase = async () => {
    try {
        const pool = await (0, exports.getPool)();
        console.log(`✅ Kết nối thành công tới SQL Server database: ${env_1.env.DB_NAME}`);
        return pool;
    }
    catch (error) {
        console.error('❌ Lỗi kết nối tới SQL Server:', error);
        throw error; // Bubble lên server.ts — KHÔNG gọi process.exit tại đây
    }
};
exports.connectDatabase = connectDatabase;
exports.default = mssql_1.default;
