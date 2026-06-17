import { AuthService } from './modules/auth/auth.service';

async function testLogin() {
  const svc = new AuthService();
  try {
    const res = await svc.login('thao@example.com', '123456');
    console.log('✅ Đăng nhập THÀNH CÔNG:', res);
    process.exit(0);
  } catch (error) {
    console.error('❌ Đăng nhập THẤT BẠI:', error);
    process.exit(1);
  }
}

testLogin();
