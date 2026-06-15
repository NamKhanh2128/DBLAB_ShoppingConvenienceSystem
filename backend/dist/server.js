"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * server.ts — Entry point
 *
 * ROOT CAUSE của "clean exit":
 * Express 5 đổi app.listen() từ callback-based sang trả về Promise<Server>.
 * Khi không await, Promise bị drop → event loop drain → clean exit.
 *
 * FIX: Dùng http.createServer(app) native để giữ server reference rõ ràng.
 */
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
// ─── GLOBAL ERROR HANDLERS ─────────────────────────────────────────────────
process.on('uncaughtException', (error) => {
    console.error('💥 [UNCAUGHT EXCEPTION]', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 [UNHANDLED REJECTION]', reason);
    // Không exit — chỉ log
});
// ─── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────
const gracefulShutdown = (server, signal) => {
    console.log(`\n⚠️  Nhận tín hiệu ${signal} — đóng server gracefully...`);
    server.close(() => {
        console.log('✅ Server đã đóng. Thoát tiến trình.');
        process.exit(0);
    });
};
// ─── BOOTSTRAP ─────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        // Dùng http.createServer(app) thay vì app.listen()
        // → Giữ server reference rõ ràng → event loop KHÔNG drain → server sống
        const server = http_1.default.createServer(app_1.default);
        server.listen(env_1.env.PORT, () => {
            console.log(`🚀 Server is running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
            console.log(`   Health check: http://localhost:${env_1.env.PORT}/health`);
        });
        // Bắt lỗi server-level (vd: EADDRINUSE — port đã bị chiếm)
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${env_1.env.PORT} đang bị chiếm. Hãy kill tiến trình cũ.`);
            }
            else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });
        // Graceful shutdown khi nhận Ctrl+C hoặc nodemon restart
        process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
    }
    catch (error) {
        console.error('❌ Không thể khởi động server:', error);
        process.exit(1);
    }
};
startServer();
