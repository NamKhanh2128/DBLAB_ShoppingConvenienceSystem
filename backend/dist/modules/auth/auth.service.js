"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const jwt_1 = require("../../core/utils/jwt");
const hash_1 = require("../../core/utils/hash");
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../config/database");
const mssql_1 = __importDefault(require("mssql"));
class AuthService {
    repo = new auth_repository_1.AuthRepository();
    async login(email, password) {
        const user = await this.repo.findByEmail(email);
        if (!user)
            throw { statusCode: 401, message: 'Sai email hoặc mật khẩu' };
        if (user.TrangThai !== 'ACTIVE')
            throw { statusCode: 403, message: 'Tài khoản đã bị khóa' };
        const valid = await (0, hash_1.comparePassword)(password, user.MatKhauHash);
        if (!valid)
            throw { statusCode: 401, message: 'Sai email hoặc mật khẩu' };
        await this.repo.updateLastLogin(user.MaNguoiDung);
        // Lấy timestamp đổi mật khẩu gần nhất để nhúng vào Token
        const pwdUpdatedAt = user.MatKhauNgayCapNhat ? new Date(user.MatKhauNgayCapNhat).getTime() : 0;
        // Sinh Access Token và Refresh Token
        const payload = {
            id: user.MaNguoiDung,
            role: user.VaiTro,
            pwdUpdatedAt
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.MaNguoiDung });
        const { MatKhauHash, ...safe } = user;
        return {
            user: safe,
            token: accessToken,
            refreshToken,
            requires2FA: !!user.IsTwoFactorEnabled
        };
    }
    async register(data) {
        const email = data.email.trim().toLowerCase();
        const exists = await this.repo.findByEmail(email);
        if (exists)
            throw { statusCode: 400, message: 'Email đã được sử dụng' };
        const hashed = await (0, hash_1.hashPassword)(data.password);
        // Tên được làm sạch và chuẩn hóa trước khi lưu
        const cleanName = data.hoTen.trim().replace(/\s+/g, ' ');
        const created = await this.repo.create({ hoTen: cleanName, email, matKhauHash: hashed });
        // Tạo nhóm gia đình mặc định cho người dùng vừa đăng ký
        const pool = await (0, database_1.getPool)();
        const groupName = `Gia đình của ${cleanName}`;
        const groupRes = await pool.request()
            .input('name', mssql_1.default.NVarChar(100), groupName)
            .input('leader', mssql_1.default.Int, created.MaNguoiDung)
            .query(`
        INSERT INTO NhomGiaDinh (TenNhom, TruongNhom, MaxThanhVien)
        OUTPUT INSERTED.MaNhom
        VALUES (@name, @leader, 10)
      `);
        const groupId = groupRes.recordset[0].MaNhom;
        // Thêm leader vào bảng thành viên
        await pool.request()
            .input('g', mssql_1.default.Int, groupId)
            .input('u', mssql_1.default.Int, created.MaNguoiDung)
            .query(`INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro) VALUES (@g, @u, 'LEADER')`);
        // Sinh mã mời mặc định dài hạn (100 năm, tối đa 100 lượt dùng)
        const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
        await pool.request()
            .input('groupId', mssql_1.default.Int, groupId)
            .input('creatorId', mssql_1.default.Int, created.MaNguoiDung)
            .input('code', mssql_1.default.NVarChar(8), code)
            .input('maxUses', mssql_1.default.Int, 100)
            .input('expires', mssql_1.default.DateTime2, expiresAt)
            .query(`
        INSERT INTO FamilyInvites (Id, MaNhom, Code, TaoBoiId, MaxUses, ExpiresAt)
        VALUES (NEWID(), @groupId, @code, @creatorId, @maxUses, @expires)
      `);
        const { MatKhauHash, ...safe } = created;
        return { ...safe, MaNhom: groupId };
    }
    async getMe(userId) {
        const user = await this.repo.findById(userId);
        if (!user)
            throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
        return user;
    }
    // ─── 2FA / MFA METHODS ─────────────────────────────────────────────────────
    async generate2FA(userId, email) {
        // Tạo secret base32-like hex ngẫu nhiên bảo mật cao
        const secret = crypto_1.default.randomBytes(20).toString('hex');
        // Sinh đường dẫn OTPAuth để người dùng quét mã QR
        // (Phía Frontend có thể vẽ ảnh QR bằng canvas hoặc thư viện qrcode)
        const otpauthUrl = `otpauth://totp/ShoppingConvenience:${email}?secret=${secret}&issuer=ShoppingConvenience`;
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('secret', mssql_1.default.NVarChar(255), secret)
            .input('id', mssql_1.default.Int, userId)
            .query('UPDATE NguoiDung SET TwoFactorSecret = @secret WHERE MaNguoiDung = @id');
        return { secret, otpauthUrl };
    }
    async enable2FA(userId, code) {
        const pool = await (0, database_1.getPool)();
        const userRes = await pool.request()
            .input('id', mssql_1.default.Int, userId)
            .query('SELECT TwoFactorSecret FROM NguoiDung WHERE MaNguoiDung = @id');
        const user = userRes.recordset[0];
        if (!user || !user.TwoFactorSecret) {
            throw { statusCode: 400, message: 'Vui lòng cấu hình sinh khóa 2FA trước' };
        }
        const isValid = this.verifyTOTP(user.TwoFactorSecret, code);
        if (!isValid)
            throw { statusCode: 400, message: 'Mã OTP 2FA không chính xác hoặc đã hết hạn' };
        await pool.request()
            .input('id', mssql_1.default.Int, userId)
            .query('UPDATE NguoiDung SET IsTwoFactorEnabled = 1 WHERE MaNguoiDung = @id');
        return { success: true };
    }
    async disable2FA(userId) {
        const pool = await (0, database_1.getPool)();
        await pool.request()
            .input('id', mssql_1.default.Int, userId)
            .query('UPDATE NguoiDung SET IsTwoFactorEnabled = 0, TwoFactorSecret = NULL WHERE MaNguoiDung = @id');
        return { success: true };
    }
    // Thuật toán xác minh TOTP chuẩn xác dùng cơ chế thời gian HMAC-SHA1
    verifyTOTP(secret, token) {
        const timeStep = 30; // 30 giây hết hạn
        const window = 1; // Bù trừ +/- 1 chu kỳ thời gian (tổng cộng 90 giây) để tránh lệch múi giờ client-server
        const currentTime = Math.floor(Date.now() / 1000 / timeStep);
        for (let i = -window; i <= window; i++) {
            const timeVal = currentTime + i;
            const hmac = crypto_1.default.createHmac('sha1', secret);
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
exports.AuthService = AuthService;
