import { AuthRepository } from './auth.repository';
import { generateAccessToken, generateRefreshToken } from '../../core/utils/jwt';
import { hashPassword, comparePassword } from '../../core/utils/hash';
import crypto from 'crypto';
import { getPool } from '../../config/database';
import sql from 'mssql';

export class AuthService {
  private repo = new AuthRepository();

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw { statusCode: 401, message: 'Sai email hoặc mật khẩu' };
    if (user.TrangThai !== 'ACTIVE') throw { statusCode: 403, message: 'Tài khoản đã bị khóa' };

    const valid = await comparePassword(password, user.MatKhauHash);
    if (!valid) throw { statusCode: 401, message: 'Sai email hoặc mật khẩu' };

    await this.repo.updateLastLogin(user.MaNguoiDung);

    // Lấy timestamp đổi mật khẩu gần nhất để nhúng vào Token
    const pwdUpdatedAt = user.MatKhauNgayCapNhat ? new Date(user.MatKhauNgayCapNhat).getTime() : 0;

    // Sinh Access Token và Refresh Token
    const payload = { 
      id: user.MaNguoiDung, 
      role: user.VaiTro, 
      pwdUpdatedAt 
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.MaNguoiDung });

    const { MatKhauHash, ...safe } = user;
    return { 
      user: safe, 
      token: accessToken,
      refreshToken,
      requires2FA: !!user.IsTwoFactorEnabled
    };
  }

  async register(data: { hoTen: string; email: string; password: string }) {
    const email = data.email.trim().toLowerCase();
    const exists = await this.repo.findByEmail(email);
    if (exists) throw { statusCode: 400, message: 'Email đã được sử dụng' };

    const hashed = await hashPassword(data.password);
    
    // Tên được làm sạch và chuẩn hóa trước khi lưu
    const cleanName = data.hoTen.trim().replace(/\s+/g, ' ');
    const created = await this.repo.create({ hoTen: cleanName, email, matKhauHash: hashed });

    // Tạo nhóm gia đình mặc định cho người dùng vừa đăng ký
    const pool = await getPool();
    const groupName = `Gia đình của ${cleanName}`;
    const groupRes = await pool.request()
      .input('name', sql.NVarChar(100), groupName)
      .input('leader', sql.Int, created.MaNguoiDung)
      .query(`
        INSERT INTO NhomGiaDinh (TenNhom, TruongNhom, MaxThanhVien)
        OUTPUT INSERTED.MaNhom
        VALUES (@name, @leader, 10)
      `);
    const groupId = groupRes.recordset[0].MaNhom;

    // Thêm leader vào bảng thành viên
    await pool.request()
      .input('g', sql.Int, groupId)
      .input('u', sql.Int, created.MaNguoiDung)
      .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@g, @u, 'LEADER')`);

    // Sinh mã mời mặc định dài hạn (100 năm, tối đa 100 lượt dùng)
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('creatorId', sql.Int, created.MaNguoiDung)
      .input('code', sql.NVarChar(8), code)
      .input('maxUses', sql.Int, 100)
      .input('expires', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO FamilyInvites (Id, MaNhom, Code, TaoBoiId, MaxUses, ExpiresAt)
        VALUES (NEWID(), @groupId, @code, @creatorId, @maxUses, @expires)
      `);

    const { MatKhauHash, ...safe } = created;
    return { ...safe, MaNhom: groupId };
  }

  async getMe(userId: number) {
    const user = await this.repo.findById(userId);
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
    return user;
  }

  // ─── 2FA / MFA METHODS ─────────────────────────────────────────────────────
  
  async generate2FA(userId: number, email: string) {
    // Tạo secret base32-like hex ngẫu nhiên bảo mật cao
    const secret = crypto.randomBytes(20).toString('hex');
    
    // Sinh đường dẫn OTPAuth để người dùng quét mã QR
    // (Phía Frontend có thể vẽ ảnh QR bằng canvas hoặc thư viện qrcode)
    const otpauthUrl = `otpauth://totp/ShoppingConvenience:${email}?secret=${secret}&issuer=ShoppingConvenience`;

    const pool = await getPool();
    await pool.request()
      .input('secret', sql.NVarChar(255), secret)
      .input('id', sql.Int, userId)
      .query('UPDATE NguoiDung SET TwoFactorSecret = @secret WHERE MaNguoiDung = @id');

    return { secret, otpauthUrl };
  }

  async enable2FA(userId: number, code: string) {
    const pool = await getPool();
    const userRes = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT TwoFactorSecret FROM NguoiDung WHERE MaNguoiDung = @id');

    const user = userRes.recordset[0];
    if (!user || !user.TwoFactorSecret) {
      throw { statusCode: 400, message: 'Vui lòng cấu hình sinh khóa 2FA trước' };
    }

    const isValid = this.verifyTOTP(user.TwoFactorSecret, code);
    if (!isValid) throw { statusCode: 400, message: 'Mã OTP 2FA không chính xác hoặc đã hết hạn' };

    await pool.request()
      .input('id', sql.Int, userId)
      .query('UPDATE NguoiDung SET IsTwoFactorEnabled = 1 WHERE MaNguoiDung = @id');

    return { success: true };
  }

  async disable2FA(userId: number) {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, userId)
      .query('UPDATE NguoiDung SET IsTwoFactorEnabled = 0, TwoFactorSecret = NULL WHERE MaNguoiDung = @id');
    return { success: true };
  }

  // Thuật toán xác minh TOTP chuẩn xác dùng cơ chế thời gian HMAC-SHA1
  verifyTOTP(secret: string, token: string): boolean {
    const timeStep = 30; // 30 giây hết hạn
    const window = 1;    // Bù trừ +/- 1 chu kỳ thời gian (tổng cộng 90 giây) để tránh lệch múi giờ client-server
    const currentTime = Math.floor(Date.now() / 1000 / timeStep);

    for (let i = -window; i <= window; i++) {
      const timeVal = currentTime + i;
      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(String(timeVal));
      const digest = hmac.digest('hex');

      // Chuyển digest hex sang số 6 chữ số
      const numeric = parseInt(digest.substring(0, 8), 16) % 1000000;
      const expectedToken = String(numeric).padStart(6, '0');

      if (expectedToken === token.trim()) {
        return true;
      }
    }
    return false;
  }
}
