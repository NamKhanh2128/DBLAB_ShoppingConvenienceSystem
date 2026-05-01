/**
 * server.ts — Entry point
 *
 * ROOT CAUSE của "clean exit":
 * Express 5 đổi app.listen() từ callback-based sang trả về Promise<Server>.
 * Khi không await, Promise bị drop → event loop drain → clean exit.
 *
 * FIX: Dùng http.createServer(app) native để giữ server reference rõ ràng.
 */
import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

// ─── GLOBAL ERROR HANDLERS ─────────────────────────────────────────────────
process.on('uncaughtException', (error: Error) => {
  console.error('💥 [UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 [UNHANDLED REJECTION]', reason);
  // Không exit — chỉ log
});

// ─── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────
const gracefulShutdown = (server: http.Server, signal: string) => {
  console.log(`\n⚠️  Nhận tín hiệu ${signal} — đóng server gracefully...`);
  server.close(() => {
    console.log('✅ Server đã đóng. Thoát tiến trình.');
    process.exit(0);
  });
};

// ─── BOOTSTRAP ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDatabase();

    // Dùng http.createServer(app) thay vì app.listen()
    // → Giữ server reference rõ ràng → event loop KHÔNG drain → server sống
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`   Health check: http://localhost:${env.PORT}/health`);
    });

    // Bắt lỗi server-level (vd: EADDRINUSE — port đã bị chiếm)
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${env.PORT} đang bị chiếm. Hãy kill tiến trình cũ.`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown khi nhận Ctrl+C hoặc nodemon restart
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT',  () => gracefulShutdown(server, 'SIGINT'));

  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    process.exit(1);
  }
};

startServer();