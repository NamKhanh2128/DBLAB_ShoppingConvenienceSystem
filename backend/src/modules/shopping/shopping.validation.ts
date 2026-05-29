import { z } from 'zod';

// -------------------------------------------------------
// Schema thêm item vào danh sách mua sắm
// -------------------------------------------------------
export const addItemSchema = z.object({
  tenThucPham: z
    .string()
    .min(1, 'Tên thực phẩm không được để trống')
    .max(100, 'Tên thực phẩm không được quá 100 ký tự')
    .transform(v => v.trim()),

  soLuong: z
    .number()
    .positive('Số lượng phải lớn hơn 0')
    .max(9999, 'Số lượng không được vượt quá 9,999'),

  donVi: z
    .string()
    .max(20, 'Đơn vị không được quá 20 ký tự')
    .optional()
    .transform(v => v?.trim() || null),

  giaDuKien: z
    .number()
    .min(0, 'Giá dự kiến không được âm')
    .max(999_999_999, 'Giá dự kiến quá lớn')
    .optional()
    .default(0),

  giaThucTe: z
    .number()
    .min(0, 'Giá thực tế không được âm')
    .max(999_999_999, 'Giá thực tế quá lớn')
    .optional()
    .default(0),

  danhMucHang: z
    .string()
    .max(50, 'Danh mục không được quá 50 ký tự')
    .optional()
    .transform(v => v?.trim() || null),

  nguoiPhuTrach: z.number().int().positive().nullable().optional(),
});

export type AddItemDto = z.infer<typeof addItemSchema>;

// -------------------------------------------------------
// Schema cập nhật item
// -------------------------------------------------------
export const updateItemSchema = z.object({
  tenThucPham: z
    .string()
    .min(1, 'Tên thực phẩm không được để trống')
    .max(100)
    .transform(v => v.trim())
    .optional(),

  soLuong: z
    .number()
    .positive('Số lượng phải lớn hơn 0')
    .max(9999)
    .optional(),

  donVi: z.string().max(20).optional().transform(v => v?.trim() || null),

  giaDuKien: z.number().min(0).max(999_999_999).optional(),

  giaThucTe: z.number().min(0).max(999_999_999).optional(),

  danhMucHang: z.string().max(50).optional().transform(v => v?.trim() || null),
});

export type UpdateItemDto = z.infer<typeof updateItemSchema>;

// -------------------------------------------------------
// Schema tạo danh sách mua sắm
// -------------------------------------------------------
export const createListSchema = z.object({
  maNhom: z.number().int().positive('Mã nhóm không hợp lệ'),
  ghiChu: z
    .string()
    .max(255, 'Ghi chú không được quá 255 ký tự')
    .optional()
    .transform(v => v?.trim() || null),
});

export type CreateListDto = z.infer<typeof createListSchema>;
