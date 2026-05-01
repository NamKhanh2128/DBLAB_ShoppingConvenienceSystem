import { AuthRepository } from './auth.repository';
import { generateToken } from '../../core/utils/jwt';
import { hashPassword, comparePassword } from '../../core/utils/hash';

export class AuthService {
  private repo = new AuthRepository();

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw { statusCode: 401, message: 'Sai email hoặc mật khẩu' };
    if (user.TrangThai !== 'ACTIVE') throw { statusCode: 403, message: 'Tài khoản đã bị khóa' };

    const valid = await comparePassword(password, user.MatKhauHash);
    if (!valid) throw { statusCode: 401, message: 'Sai email hoặc mật khẩu' };

    await this.repo.updateLastLogin(user.MaNguoiDung);
    const token = generateToken({ id: user.MaNguoiDung, role: user.VaiTro });
    const { MatKhauHash, ...safe } = user;
    return { user: safe, token };
  }

  async register(data: { hoTen: string; email: string; password: string }) {
    const exists = await this.repo.findByEmail(data.email);
    if (exists) throw { statusCode: 400, message: 'Email đã được sử dụng' };

    const hashed = await hashPassword(data.password);
    const id = await this.repo.create({ hoTen: data.hoTen, email: data.email, matKhauHash: hashed });
    const user = await this.repo.findById(id);
    return user;
  }

  async getMe(userId: number) {
    const user = await this.repo.findById(userId);
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
    return user;
  }
}
