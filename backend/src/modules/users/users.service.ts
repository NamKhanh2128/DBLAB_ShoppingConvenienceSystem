/**
 * users.service.ts
 * Business logic layer — nhận DTO từ controller, delegate xuống repository.
 * Không chứa SQL. Xử lý validation business rules (password matching, etc.)
 */
import { UsersRepository } from './users.repository';
import { UpdateProfileDto, ChangePasswordDto } from './user.model';
import { comparePassword, hashPassword } from '../../core/utils/hash';

export class UsersService {
  private repo = new UsersRepository();

  // ─── READ ──────────────────────────────────────────────────────────────────

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: number) {
    const user = await this.repo.findById(id);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return user;
  }

  // ─── UPDATE PROFILE ────────────────────────────────────────────────────────

  async updateProfile(id: number, dto: UpdateProfileDto) {
    // Business validation: email format check
    if (dto.email && !dto.email.includes('@')) {
      throw { statusCode: 400, message: 'Email không hợp lệ' };
    }

    await this.repo.updateProfile(id, dto);
    // Trả về bản ghi mới nhất sau khi update
    return this.getById(id);
  }

  // ─── CHANGE PASSWORD ───────────────────────────────────────────────────────

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.repo.findByIdWithPassword(id);
    if (!user) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };

    const isValid = await comparePassword(dto.currentPassword, user.MatKhauHash);
    if (!isValid) throw { statusCode: 401, message: 'Mật khẩu hiện tại không đúng' };

    if (dto.newPassword.length < 8) {
      throw { statusCode: 400, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' };
    }

    const hashed = await hashPassword(dto.newPassword);
    await this.repo.updatePassword(id, hashed);
    return { message: 'Đổi mật khẩu thành công' };
  }

  // ─── ADMIN ACTIONS ─────────────────────────────────────────────────────────

  async updateRole(id: number, role: string) {
    await this.repo.updateRole(id, role);
    return this.getById(id);
  }

  async updateStatus(id: number, status: string) {
    await this.repo.updateStatus(id, status);
    return this.getById(id);
  }

  async deleteUser(id: number) {
    await this.repo.deleteUser(id);
  }

  async getStats() {
    const total    = await this.repo.countAll();
    const active   = await this.repo.countByStatus('ACTIVE');
    const banned   = await this.repo.countByStatus('BANNED');
    const inactive = await this.repo.countByStatus('INACTIVE');
    return { total, active, banned, inactive };
  }
}
