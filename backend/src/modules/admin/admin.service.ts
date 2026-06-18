import crypto from 'crypto';
import { AdminRepository } from './admin.repository';
import { hashPassword } from '../../core/utils/hash';

export interface AdminActor {
  id: number;
  name: string;
  role: string;
  ip: string;
}

export class AdminService {
  private repo = new AdminRepository();

  async getDashboard() {
    return this.repo.getDashboardStats();
  }

  async getUsers() {
    return this.repo.getAllUsers();
  }

  async updateUserStatus(id: number, status: string, actor: AdminActor) {
    // [CHỐNG TỰ SÁT QUYỀN LỰC] Admin không thể tự khóa tài khoản của chính mình
    if (id === actor.id) {
      await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật trạng thái', 'user', 'error', `Thất bại: Tự thay đổi trạng thái bản thân sang ${status}`, actor.ip);
      throw { statusCode: 400, message: 'Bạn không thể tự khóa hoặc thay đổi trạng thái tài khoản của chính mình' };
    }

    const VALID_STATUSES = ['ACTIVE', 'LOCKED'];
    if (!VALID_STATUSES.includes(status)) {
      throw { statusCode: 400, message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: ACTIVE, LOCKED' };
    }
    await this.repo.updateUserStatus(id, status);
    await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật trạng thái', 'user', 'success', `Đã cập nhật trạng thái của người dùng ID ${id} sang ${status}`, actor.ip);
  }

  async updateUserRole(id: number, role: string, actor: AdminActor) {
    // [CHỐNG TỰ SÁT QUYỀN LỰC] Admin không thể tự hạ quyền của chính mình
    if (id === actor.id) {
      await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật vai trò', 'user', 'error', `Thất bại: Tự thay đổi vai trò bản thân sang ${role}`, actor.ip);
      throw { statusCode: 400, message: 'Bạn không thể tự hạ vai trò hoặc thay đổi quyền hạn của chính mình' };
    }

    const VALID_ROLES = ['ADMIN', 'MEMBER'];
    if (!VALID_ROLES.includes(role)) {
      throw { statusCode: 400, message: 'Vai trò không hợp lệ. Chỉ chấp nhận: ADMIN, MEMBER' };
    }
    await this.repo.updateUserRole(id, role);
    await this.repo.addAuditLog(actor.id, actor.name, 'Cập nhật vai trò', 'user', 'success', `Đã cập nhật vai trò của người dùng ID ${id} sang ${role}`, actor.ip);
  }

  async deleteUser(id: number, actor: AdminActor) {
    if (id === actor.id) {
      await this.repo.addAuditLog(actor.id, actor.name, 'Xóa người dùng', 'user', 'error', 'Thất bại: Tự xóa tài khoản bản thân', actor.ip);
      throw { statusCode: 400, message: 'Bạn không thể tự xóa tài khoản của chính mình' };
    }

    await this.repo.deleteUser(id);
    await this.repo.addAuditLog(actor.id, actor.name, 'Xóa người dùng', 'user', 'warning', `Đã thực hiện xóa mềm người dùng ID ${id}`, actor.ip);
  }

  async getAuditLogs() {
    return this.repo.getAuditLogs();
  }

  async resetUserPassword(id: number, actor: AdminActor): Promise<string> {
    if (id === actor.id) {
      await this.repo.addAuditLog(actor.id, actor.name, 'Reset mật khẩu', 'auth', 'error', 'Thất bại: Tự reset mật khẩu bản thân', actor.ip);
      throw { statusCode: 400, message: 'Bạn không thể reset mật khẩu của chính mình' };
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const bytes = crypto.randomBytes(10);
    let tempPassword = '';
    for (const byte of bytes) {
      tempPassword += chars[byte % chars.length];
    }
    const hashed = await hashPassword(tempPassword);
    await this.repo.resetUserPassword(id, hashed);
    await this.repo.addAuditLog(actor.id, actor.name, 'Reset mật khẩu', 'auth', 'success', `Đã reset mật khẩu người dùng ID ${id}`, actor.ip);
    return tempPassword;
  }

  async cleanupFakeAccounts(actor: AdminActor) {
    const cleanedCount = await this.repo.cleanupFakeAccounts();
    await this.repo.addAuditLog(
      actor.id,
      actor.name,
      'Dọn dẹp tài khoản ảo',
      'data',
      cleanedCount > 0 ? 'success' : 'warning',
      `Đã dọn dẹp hàng loạt ${cleanedCount} tài khoản ảo đăng ký trong 24 giờ qua`,
      actor.ip
    );
    return { cleanedCount };
  }

  async getReports(actor: AdminActor) {
    const raw = await this.repo.getReportsStats();

    // Dựng 7 ngày gần nhất để điền dữ liệu biểu đồ cột
    const daysOfWeek = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const activityData: any[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = daysOfWeek[date.getDay()];
      activityData.push({
        dateStr,
        day: dayName,
        new: 0,       // lists created
        active: 0     // lists completed
      });
    }

    // Ánh xạ dữ liệu từ DB vào mảng 7 ngày
    if (raw.activity && Array.isArray(raw.activity)) {
      for (const row of raw.activity) {
        if (!row.NgayTao) continue;
        let rowDateStr = '';
        if (row.NgayTao instanceof Date) {
          rowDateStr = row.NgayTao.toISOString().split('T')[0];
        } else {
          rowDateStr = String(row.NgayTao).split('T')[0];
        }
        const match = activityData.find(d => d.dateStr === rowDateStr);
        if (match) {
          match.new = Number(row.countNew || 0);
          match.active = Number(row.countCompleted || 0);
        }
      }
    }

    // Lưu Audit Log hành động
    await this.repo.addAuditLog(
      actor.id,
      actor.name,
      'Xem báo cáo hệ thống',
      'report',
      'success',
      'Đã truy xuất báo cáo tổng hợp chi tiêu, lãng phí và hoạt động toàn hệ thống',
      actor.ip
    );

    return {
      kpis: raw.kpis,
      trend: raw.trend,
      categoryDistribution: raw.categoryDistribution,
      activity: activityData,
      topFamilies: raw.topFamilies
    };
  }
}
