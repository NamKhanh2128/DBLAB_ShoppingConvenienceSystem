import { RecipesRepository } from './recipes.repository';
import { FamilyRepository } from '../family/family.repository';
import { createRecipeSchema, cookRecipeSchema } from './recipes.validation';

export class RecipesService {
  private repo = new RecipesRepository();
  private familyRepo = new FamilyRepository();

  // -------------------------------------------------------
  // Helper: kiểm tra user có thuộc nhóm gia đình không (IDOR protection)
  // -------------------------------------------------------
  private async checkGroupMembership(groupId: number, userId: number) {
    if (!groupId) {
      throw { statusCode: 400, message: 'Thiếu mã nhóm gia đình' };
    }
    const member = await this.familyRepo.isMember(groupId, userId);
    if (!member) {
      throw {
        statusCode: 403,
        message: 'Bạn không có quyền truy cập thông tin của gia đình này',
      };
    }
  }

  // -------------------------------------------------------
  // Lấy tất cả công thức (system + của nhóm)
  // -------------------------------------------------------
  async getAll(userId: number, groupId?: number) {
    // Nếu có groupId, kiểm tra user có thuộc nhóm không
    if (groupId) {
      await this.checkGroupMembership(groupId, userId);
    }
    return this.repo.getAll(groupId);
  }

  // -------------------------------------------------------
  // Lấy chi tiết một công thức + nguyên liệu
  // -------------------------------------------------------
  async getById(id: number, userId: number, groupId?: number) {
    const recipe = await this.repo.getById(id);
    if (!recipe) {
      throw { statusCode: 404, message: 'Không tìm thấy công thức' };
    }

    // Nếu là recipe riêng tư (MaNhom != null), kiểm tra quyền truy cập
    if (recipe.MaNhom !== null && recipe.MaNhom !== undefined) {
      await this.checkGroupMembership(recipe.MaNhom, userId);
    }

    const ingredients = await this.repo.getIngredients(id);
    return { ...recipe, ingredients };
  }

  // -------------------------------------------------------
  // Tạo công thức mới (luôn thuộc nhóm người tạo)
  // -------------------------------------------------------
  async create(data: any, userId: number, groupId: number) {
    // Validate + sanitize XSS
    const validatedData = createRecipeSchema.parse(data);

    // Kiểm tra user có thuộc nhóm không trước khi tạo
    await this.checkGroupMembership(groupId, userId);

    const id = await this.repo.create(validatedData, userId, groupId);
    return { MaMon: id, ...validatedData, MaNhom: groupId, MaNguoiTao: userId };
  }

  // -------------------------------------------------------
  // Cập nhật công thức (chỉ thành viên cùng nhóm mới được sửa)
  // -------------------------------------------------------
  async update(id: number, data: any, userId: number) {
    const recipe = await this.repo.getById(id);
    if (!recipe) {
      throw { statusCode: 404, message: 'Không tìm thấy công thức' };
    }

    // Không cho sửa System Recipe (MaNhom IS NULL)
    if (recipe.MaNhom === null || recipe.MaNhom === undefined) {
      throw {
        statusCode: 403,
        message: 'Không thể chỉnh sửa công thức hệ thống',
      };
    }

    // Kiểm tra IDOR: user phải thuộc nhóm sở hữu công thức
    await this.checkGroupMembership(recipe.MaNhom, userId);

    const validatedData = createRecipeSchema.partial().parse(data);
    await this.repo.update(id, validatedData);
  }

  // -------------------------------------------------------
  // Xóa công thức (chỉ thành viên cùng nhóm mới được xóa)
  // -------------------------------------------------------
  async remove(id: number, userId: number) {
    const recipe = await this.repo.getById(id);
    if (!recipe) {
      throw { statusCode: 404, message: 'Không tìm thấy công thức' };
    }

    // Không cho xóa System Recipe (MaNhom IS NULL)
    // Lý do: các system recipe là dữ liệu mẫu chung cho toàn hệ thống
    if (recipe.MaNhom === null || recipe.MaNhom === undefined) {
      throw {
        statusCode: 403,
        message: 'Không thể xóa công thức hệ thống. Chỉ Admin mới có quyền này.',
      };
    }

    // Kiểm tra IDOR: user phải thuộc nhóm sở hữu công thức
    await this.checkGroupMembership(recipe.MaNhom, userId);

    await this.repo.remove(id);
  }

  // -------------------------------------------------------
  // "Đã nấu xong" — tự động trừ nguyên liệu trong kho
  // -------------------------------------------------------
  async cookRecipe(id: number, data: any, userId: number) {
    // Validate input
    const validated = cookRecipeSchema.parse(data);

    // Lấy thông tin công thức
    const recipe = await this.repo.getById(id);
    if (!recipe) {
      throw { statusCode: 404, message: 'Không tìm thấy công thức' };
    }

    // Kiểm tra quyền truy cập: phải là thành viên nhóm
    await this.checkGroupMembership(validated.maNhom, userId);

    // Tính hệ số nhân từ số khẩu phần
    // Ví dụ: công thức gốc 4 người, nấu 8 người → multiplier = 2.0
    const defaultServings = recipe.KhauPhan || 1;
    const multiplier = validated.soKhauPhan / defaultServings;

    // Trừ nguyên liệu trong kho
    const result = await this.repo.deductInventoryForCooking(
      id,
      validated.maNhom,
      multiplier
    );

    return {
      message: `Đã trừ ${result.deducted} nguyên liệu khỏi kho`,
      deductedCount: result.deducted,
      notFoundIngredients: result.notFound,
      warning:
        result.notFound.length > 0
          ? `${result.notFound.length} nguyên liệu không đủ trong kho: ${result.notFound.join(', ')}`
          : null,
    };
  }

  // -------------------------------------------------------
  // Gợi ý công thức theo nguyên liệu có sẵn trong kho
  // -------------------------------------------------------
  async getSuggested(userId: number, groupId: number) {
    await this.checkGroupMembership(groupId, userId);
    const suggestions = await this.repo.getSuggestedByInventory(groupId);

    // Tính % nguyên liệu đủ cho mỗi công thức
    return suggestions.map(s => ({
      ...s,
      matchPercent:
        s.TongNguyenLieu > 0
          ? Math.round((s.NguyenLieuDu / s.TongNguyenLieu) * 100)
          : 0,
      canCook: s.TongNguyenLieu > 0 && s.NguyenLieuDu === s.TongNguyenLieu,
    }));
  }
}
