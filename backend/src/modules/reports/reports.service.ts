import { ReportsRepository } from './reports.repository';
import { FamilyRepository } from '../family/family.repository';

export class ReportsService {
  private repo = new ReportsRepository();
  private familyRepo = new FamilyRepository();

  private async checkMembership(groupId: number, userId: number) {
    if (!groupId) throw { statusCode: 400, message: 'Thiếu groupId' };
    const member = await this.familyRepo.isMember(groupId, userId);
    if (!member) throw { statusCode: 403, message: 'Bạn không có quyền truy cập dữ liệu báo cáo của nhóm gia đình này' };
  }

  async getReports(groupId: number, userId: number) {
    await this.checkMembership(groupId, userId);
    return this.repo.getByGroup(groupId);
  }

  async getSummary(groupId: number, userId: number, timezoneOffset: number = 0, startDate?: string, endDate?: string) {
    await this.checkMembership(groupId, userId);

    // Validate khoảng thời gian
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw { statusCode: 400, message: 'Định dạng ngày lọc không hợp lệ' };
      }
      if (start > end) {
        throw { statusCode: 400, message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' };
      }
      // Giới hạn tối đa 366 ngày (1 năm) để bảo vệ hiệu năng hệ thống
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 366) {
        throw { statusCode: 400, message: 'Khoảng thời gian lọc không được vượt quá 1 năm (366 ngày)' };
      }
    }

    return this.repo.getSummary(groupId, timezoneOffset, startDate, endDate);
  }

  async create(data: any, userId: number) {
    await this.checkMembership(Number(data.maNhom), userId);
    const id = await this.repo.create(data);
    return { MaBaoCao: id, ...data };
  }
}
