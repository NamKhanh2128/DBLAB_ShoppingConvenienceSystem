import { MealPlanRepository } from './meal-plan.repository';
import { FamilyRepository } from '../family/family.repository';
import { RecipesRepository } from '../recipes/recipes.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ShoppingRepository } from '../shopping/shopping.repository';
import { createMealPlanSchema, updateMealPlanSchema } from './meal-plan.validation';

export class MealPlanService {
  private repo = new MealPlanRepository();
  private familyRepo = new FamilyRepository();
  private recipesRepo = new RecipesRepository();
  private inventoryRepo = new InventoryRepository();
  private shoppingRepo = new ShoppingRepository();

  /**
   * Helper kiểm tra chéo phân quyền IDOR chéo nhóm gia đình
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

  async getByDateRange(groupId: number, start: string, end: string, userId: number) {
    await this.checkGroupMembership(groupId, userId);
    return this.repo.getByGroupAndDate(groupId, start, end);
  }

  async getToday(groupId: number, clientDate: string | undefined, userId: number) {
    await this.checkGroupMembership(groupId, userId);
    return this.repo.getToday(groupId, clientDate);
  }

  async create(data: any, creatorId: number) {
    // Validate bằng Zod (Ngăn thực đơn quá khứ, validate buổi/số lượng khẩu phần)
    const validatedData = createMealPlanSchema.parse(data);

    // Kiểm tra bảo mật IDOR
    await this.checkGroupMembership(validatedData.maNhom, creatorId);

    // Kiểm tra món ăn trùng lặp phi lý
    const isDup = await this.repo.checkDuplicateMeal(
      validatedData.maNhom,
      validatedData.ngay,
      validatedData.buoi,
      validatedData.maMon
    );
    if (isDup) {
      throw { statusCode: 400, message: 'Món ăn này đã được lên lịch cho buổi ăn của ngày hôm đó rồi' };
    }

    const id = await this.repo.create(validatedData);
    return { MaKeHoach: id, ...validatedData };
  }

  async update(id: number, data: any, updaterId: number) {
    // Validate bằng Zod
    const validatedData = updateMealPlanSchema.parse(data);

    // Tìm kế hoạch hiện tại
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Không tìm thấy kế hoạch bữa ăn này' };
    }

    // Kiểm tra chéo IDOR
    await this.checkGroupMembership(existing.MaNhom, updaterId);

    await this.repo.update(id, validatedData);
  }

  async remove(id: number, deleterId: number) {
    // Tìm kế hoạch hiện tại
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Không tìm thấy kế hoạch bữa ăn này' };
    }

    // Kiểm tra chéo IDOR
    await this.checkGroupMembership(existing.MaNhom, deleterId);

    await this.repo.remove(id);
  }

  /**
   * Sao chép hàng loạt kế hoạch ăn uống (offset days)
   */
  async copyMealPlanRange(groupId: number, fromStart: string, fromEnd: string, toStart: string, userId: number) {
    await this.checkGroupMembership(groupId, userId);

    // Chặn sao chép kế hoạch sang quá khứ
    const d = new Date(toStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() < today.getTime()) {
      throw { statusCode: 400, message: 'Không được sao chép kế hoạch bữa ăn vào các ngày trong quá khứ' };
    }

    await this.repo.copyMeals(groupId, fromStart, fromEnd, toStart);
  }

  /**
   * Phân tích và so khớp nguyên liệu trong kho so với thực đơn lên kế hoạch
   */
  async checkIngredientsSufficiency(maMon: number, soKhauPhan: number, groupId: number, userId: number) {
    await this.checkGroupMembership(groupId, userId);

    // 1. Lấy tất cả nguyên liệu tiêu chuẩn của công thức
    const recipeIngredients = await this.recipesRepo.getIngredients(maMon);
    
    // 2. Lấy kho thực phẩm của nhóm gia đình hiện có
    const pantryItems = await this.inventoryRepo.getByGroup(groupId);

    // 3. Tiến hành đối chiếu và tính toán
    const details = recipeIngredients.map((ing: any) => {
      // Giả sử khẩu phần chuẩn của công thức mặc định là cho 4 người ăn
      const requiredQty = ing.SoLuongCan * (soKhauPhan / 4);

      // Tìm kiếm nguyên liệu trong tủ lạnh bằng cách so khớp tên không phân biệt hoa thường
      const matchedPantryItems = pantryItems.filter(
        (p: any) => p.TenTP.toLowerCase().trim() === ing.TenTP.toLowerCase().trim()
      );
      
      const availableQty = matchedPantryItems.reduce((sum: number, p: any) => sum + p.SoLuong, 0);
      const isEnough = availableQty >= requiredQty;
      const missing = isEnough ? 0 : requiredQty - availableQty;

      return {
        tenThucPham: ing.TenTP,
        soLuongCan: requiredQty,
        soLuongKho: availableQty,
        donVi: ing.DonVi || 'cái',
        thieu: missing,
        isEnough: isEnough
      };
    });

    const overallEnough = details.every(d => d.isEnough);
    return {
      enough: overallEnough,
      details: details
    };
  }

  /**
   * Tự động thêm các nguyên liệu thiếu vào danh sách mua sắm đang tạo
   */
  async autoAddMissingToShoppingList(maMon: number, soKhauPhan: number, groupId: number, userId: number) {
    await this.checkGroupMembership(groupId, userId);

    // 1. Kiểm tra lượng thiếu
    const analysis = await this.checkIngredientsSufficiency(maMon, soKhauPhan, groupId, userId);
    const missingItems = analysis.details.filter(d => d.thieu > 0);

    if (missingItems.length === 0) {
      return { success: true, message: 'Đầy đủ nguyên liệu trong kho, không cần thêm vào danh sách mua sắm' };
    }

    // 2. Tìm danh sách mua sắm có trạng thái 'DANG_TAO'
    const lists = await this.shoppingRepo.getListsByGroup(groupId);
    let activeList = lists.find(l => l.TrangThai === 'DANG_TAO');
    
    let listId: number;
    if (activeList) {
      listId = activeList.MaDanhSach;
    } else {
      // Tạo danh sách mua sắm tự động mới
      listId = await this.shoppingRepo.createList(groupId, 'Tạo tự động từ Kế hoạch bữa ăn');
    }

    // 3. Đẩy các nguyên liệu thiếu vào danh sách mua sắm
    for (const item of missingItems) {
      await this.shoppingRepo.addItem(listId, {
        tenThucPham: `${item.tenThucPham} (thiếu từ Thực đơn)`,
        soLuong: item.thieu,
        donVi: item.donVi,
        nguoiPhuTrach: userId,
        giaDuKien: 0,
        giaThucTe: 0,
        danhMucHang: 'Thực phẩm tươi',
      });
    }

    return {
      success: true,
      message: `Đã tự động thêm ${missingItems.length} nguyên liệu thiếu vào danh sách mua sắm`,
      listId: listId
    };
  }
}
