import { ShoppingRepository } from './shopping.repository';
import { FamilyRepository } from '../family/family.repository';
import { addItemSchema, updateItemSchema, createListSchema } from './shopping.validation';

export class ShoppingService {
  private repo = new ShoppingRepository();
  private familyRepo = new FamilyRepository();

  // -------------------------------------------------------
  // Helper: kiểm tra list có thuộc nhóm của user không (IDOR)
  // -------------------------------------------------------
  private async checkListOwnership(listId: number, userId: number) {
    const list = await this.repo.getListById(listId);
    if (!list) {
      throw { statusCode: 404, message: 'Không tìm thấy danh sách mua sắm' };
    }
    const member = await this.familyRepo.isMember(list.MaNhom, userId);
    if (!member) {
      throw {
        statusCode: 403,
        message: 'Bạn không có quyền truy cập danh sách này',
      };
    }
    return list;
  }

  // -------------------------------------------------------
  // Lists
  // -------------------------------------------------------
  async getLists(groupId: number, userId: number) {
    const member = await this.familyRepo.isMember(groupId, userId);
    if (!member) {
      throw { statusCode: 403, message: 'Bạn không phải thành viên nhóm này' };
    }
    return this.repo.getListsByGroup(groupId);
  }

  async createList(data: any, userId: number) {
    const validated = createListSchema.parse(data);
    // Kiểm tra user thuộc nhóm trước khi tạo
    const member = await this.familyRepo.isMember(validated.maNhom, userId);
    if (!member) {
      throw { statusCode: 403, message: 'Bạn không phải thành viên nhóm này' };
    }
    const id = await this.repo.createList(validated.maNhom, validated.ghiChu);
    return { MaDanhSach: id, ...validated };
  }

  async updateStatus(listId: number, status: string, userId: number) {
    await this.checkListOwnership(listId, userId);
    const validStatuses = ['DANG_TAO', 'DANG_MUA', 'HOAN_THANH', 'HUY'];
    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: `Trạng thái không hợp lệ. Cho phép: ${validStatuses.join(', ')}` };
    }
    await this.repo.updateListStatus(listId, status);
  }

  async deleteList(listId: number, userId: number) {
    await this.checkListOwnership(listId, userId);
    await this.repo.deleteList(listId);
  }

  // -------------------------------------------------------
  // Items
  // -------------------------------------------------------
  async getItems(listId: number, userId: number) {
    await this.checkListOwnership(listId, userId);
    return this.repo.getItems(listId);
  }

  /**
   * Thêm item vào danh sách.
   * Auto-merge: nếu đã có item cùng tên+đơn vị chưa mua → cộng số lượng.
   */
  async addItem(listId: number, data: any, userId: number) {
    // Kiểm tra IDOR
    await this.checkListOwnership(listId, userId);

    // Validate dữ liệu đầu vào
    const validated = addItemSchema.parse(data);

    // Auto-merge: kiểm tra có item trùng tên+đơn vị không
    const existing = await this.repo.findDuplicateItem(
      listId,
      validated.tenThucPham,
      validated.donVi || null
    );

    if (existing) {
      // Gom nhóm: cộng số lượng vào item đã có
      await this.repo.mergeItemQuantity(existing.MaCT, validated.soLuong);
      return {
        MaCT: existing.MaCT,
        merged: true,
        message: `Đã cộng thêm ${validated.soLuong} ${validated.donVi || ''} vào "${validated.tenThucPham}" (tổng: ${existing.SoLuong + validated.soLuong})`,
      };
    }

    // Tạo mới
    const id = await this.repo.addItem(listId, validated);
    return { MaCT: id, merged: false, ...validated };
  }

  async toggleItem(itemId: number, done: boolean, userId: number) {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw { statusCode: 404, message: 'Không tìm thấy món hàng' };

    // IDOR: kiểm tra qua list
    await this.checkListOwnership(item.MaDanhSach, userId);
    await this.repo.toggleItem(itemId, done, userId);
  }

  async updateItem(itemId: number, data: any, userId: number) {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw { statusCode: 404, message: 'Không tìm thấy món hàng' };

    await this.checkListOwnership(item.MaDanhSach, userId);
    const validated = updateItemSchema.parse(data);
    await this.repo.updateItem(itemId, validated);
  }

  async deleteItem(itemId: number, userId: number) {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw { statusCode: 404, message: 'Không tìm thấy món hàng' };

    await this.checkListOwnership(item.MaDanhSach, userId);
    await this.repo.deleteItem(itemId);
  }

  // -------------------------------------------------------
  // Hoàn thành mua sắm & tự động nhập kho
  // -------------------------------------------------------
  /**
   * Sau khi mua xong, nhấn "Hoàn thành & Nhập kho":
   *   1. Lấy toàn bộ items có DaMua=1
   *   2. Upsert từng item vào KhoThucPham của nhóm (cộng nếu trùng tên)
   *   3. Đổi trạng thái danh sách thành HOAN_THANH
   *
   * @returns { added, merged, total } — số lượng items được xử lý
   */
  async completeAndRestock(listId: number, userId: number) {
    const list = await this.checkListOwnership(listId, userId);

    // Lấy items đã mua
    const purchasedItems = await this.repo.getPurchasedItems(listId);
    if (purchasedItems.length === 0) {
      throw {
        statusCode: 400,
        message: 'Chưa có món nào được đánh dấu "Đã mua". Hãy tick vào các món đã mua trước.',
      };
    }

    let addedCount = 0;
    let mergedCount = 0;

    // Nhập từng item vào kho
    for (const item of purchasedItems) {
      const result = await this.repo.upsertInventoryItem(
        list.MaNhom,
        item.TenThucPham,
        item.SoLuong,
        item.DonVi,
        userId
      );
      if (result === 'added') addedCount++;
      else mergedCount++;
    }

    // Đánh dấu danh sách là Hoàn thành
    await this.repo.updateListStatus(listId, 'HOAN_THANH');

    return {
      total: purchasedItems.length,
      addedToInventory: addedCount,
      mergedWithExisting: mergedCount,
      message: `✅ Đã nhập ${addedCount} món mới và cộng thêm ${mergedCount} món vào kho.`,
    };
  }

  // -------------------------------------------------------
  // Gom nhóm nguyên liệu trùng lặp
  // -------------------------------------------------------
  /**
   * Gom nhóm tất cả items trùng tên+đơn vị trong một danh sách.
   * Giữ lại item đầu tiên, cộng tổng số lượng, xóa bản ghi thừa.
   */
  async mergeAllDuplicates(listId: number, userId: number) {
    await this.checkListOwnership(listId, userId);
    const mergedCount = await this.repo.mergeAllDuplicates(listId);

    return {
      mergedCount,
      message:
        mergedCount > 0
          ? `✅ Đã gom nhóm ${mergedCount} dòng trùng lặp.`
          : 'Không có nguyên liệu trùng lặp nào trong danh sách này.',
    };
  }
}
