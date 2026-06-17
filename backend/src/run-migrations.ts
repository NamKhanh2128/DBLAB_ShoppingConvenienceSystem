import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'shoppingdb',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    ...(process.env.DB_INSTANCE ? { instanceName: process.env.DB_INSTANCE } : {}),
  }
};

async function runMigrations() {
  let pool: sql.ConnectionPool | null = null;
  try {
    console.log('🔄 Đang kết nối tới Database để chạy migrations...');
    pool = await sql.connect(config);
    console.log('✅ Đã kết nối!');

    const migrationsDir = path.join(__dirname, '../../database/migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Thư mục migrations không tồn tại tại: ${migrationsDir}`);
    }

    // Đọc các file .sql và sắp xếp theo thứ tự
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && f !== 'shoppingdb.sql')
      .sort();

    console.log(`Tìm thấy ${files.length} file migrations.`);

    for (const file of files) {
      console.log(`Executing ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlText = fs.readFileSync(filePath, 'utf8');

      // Tách các lệnh SQL bằng GO
      const commands = sqlText
        .split(/^\s*GO\s*$/im)
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      for (const cmd of commands) {
        await pool.request().batch(cmd);
      }
      console.log(`✅ Thành công: ${file}`);
    }

    console.log('🎉 ĐÃ CHẠY TẤT CẢ MIGRATIONS THÀNH CÔNG!');
  } catch (error) {
    console.error('❌ Lỗi chạy migrations:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

runMigrations();
