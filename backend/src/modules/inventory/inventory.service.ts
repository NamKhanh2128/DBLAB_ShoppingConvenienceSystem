import { InventoryRepository } from './inventory.repository';
import { FamilyRepository } from '../family/family.repository';
import { addFoodSchema, updateFoodSchema } from './inventory.validation';

export class InventoryService {
  private repo = new InventoryRepository();
  private familyRepo = new FamilyRepository();

  /**
   * Helper kiểm tra chéo quyền hạn thành viên trong nhóm gia đình.
   */
  private async checkGroupMembership(groupId: number, userId: number) {
    if (!groupId) {
      throw { statusCode: 400, message: 'Thiếu mã nhóm gia đình' };
    }
    const member = await this.familyRepo.isMember(groupId, userId);
    if (!member) {
      throw { statusCode: 403, message: 'Bạn không có quyền truy cập thông tin của gia đình này' };
    }
  }

  async getInventory(groupId: number, userId: number) {
    await this.checkGroupMembership(groupId, userId);
    return this.repo.getByGroup(groupId);
  }

  async getExpiring(groupId: number, userId: number) {
    await this.checkGroupMembership(groupId, userId);
    return this.repo.getExpiring(groupId, 3);
  }

  async addFood(data: any, creatorId: number) {
    // Tự động gán mã nhóm mặc định là 1 nếu maNhom bị null/không hợp lệ khi chạy ở localhost
    if ((data.maNhom === null || data.maNhom === undefined || isNaN(Number(data.maNhom))) && 
        (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
      data.maNhom = 1;
    }

    // Validate dữ liệu đầu vào bằng Zod
    const validatedData = addFoodSchema.parse(data);
    
    // Kiểm tra bảo mật IDOR
    await this.checkGroupMembership(validatedData.maNhom, creatorId);

    const id = await this.repo.add(validatedData, creatorId);
    return { MaTP: id, ...validatedData };
  }

  async updateFood(id: number, data: any, updaterId: number) {
    // Validate dữ liệu đầu vào bằng Zod
    const validatedData = updateFoodSchema.parse(data);

    // Lấy thông tin hiện tại trong kho
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Không tìm thấy thực phẩm này trong kho' };
    }

    // Kiểm tra chéo phân quyền IDOR
    await this.checkGroupMembership(existing.MaNhom, updaterId);

    // Thực hiện cập nhật an toàn kiểm soát xung đột OCC
    const success = await this.repo.update(id, validatedData, updaterId, existing);
    if (!success) {
      throw { 
        statusCode: 409, 
        message: 'Vật phẩm đã được cập nhật bởi một thành viên khác trong gia đình. Vui lòng tải lại trang.' 
      };
    }
  }

  async deleteFood(id: number, deleterId: number) {
    // Lấy thông tin hiện tại trong kho
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Không tìm thấy thực phẩm này trong kho' };
    }

    // Kiểm tra chéo phân quyền IDOR
    await this.checkGroupMembership(existing.MaNhom, deleterId);

    await this.repo.remove(id, deleterId, existing);
  }

  async getAuditLogs(groupId: number, userId: number) {
    await this.checkGroupMembership(groupId, userId);
    return this.repo.getAuditLogs(groupId);
  }

  async getCount(groupId: number, userId: number) {
    await this.checkGroupMembership(groupId, userId);
    return this.repo.countByGroup(groupId);
  }
}
