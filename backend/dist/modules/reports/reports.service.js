"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const reports_repository_1 = require("./reports.repository");
const family_repository_1 = require("../family/family.repository");
class ReportsService {
    repo = new reports_repository_1.ReportsRepository();
    familyRepo = new family_repository_1.FamilyRepository();
    async checkMembership(groupId, userId) {
        if (!groupId)
            throw { statusCode: 400, message: 'Thiếu groupId' };
        const member = await this.familyRepo.isMember(groupId, userId);
        if (!member)
            throw { statusCode: 403, message: 'Bạn không có quyền truy cập dữ liệu báo cáo của nhóm gia đình này' };
    }
    async getReports(groupId, userId) {
        await this.checkMembership(groupId, userId);
        return this.repo.getByGroup(groupId);
    }
    async getSummary(groupId, userId, timezoneOffset = 0, startDate, endDate) {
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
    async create(data, userId) {
        await this.checkMembership(Number(data.maNhom), userId);
        const id = await this.repo.create(data);
        return { MaBaoCao: id, ...data };
    }
}
exports.ReportsService = ReportsService;
