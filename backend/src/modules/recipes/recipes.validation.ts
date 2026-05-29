import { z } from 'zod';

/**
 * Hàm sanitize đơn giản loại bỏ HTML tags để ngăn chặn Stored XSS.
 * Lý do: server-side Express không có DOM, dùng regex đủ an toàn.
 */
function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// -------------------------------------------------------
// Schema tạo/cập nhật công thức nấu ăn
// -------------------------------------------------------
export const createRecipeSchema = z.object({
  tenMon: z
    .string()
    .min(2, 'Tên món phải có ít nhất 2 ký tự')
    .max(200, 'Tên món không được quá 200 ký tự')
    .transform(v => sanitizeHtml(v)),

  congThuc: z
    .string()
    .max(5000)
    .optional()
    .transform(v => (v ? sanitizeHtml(v) : v)),

  huongDan: z
    .string()
    .max(10000, 'Hướng dẫn không được quá 10,000 ký tự')
    .optional()
    .transform(v => (v ? sanitizeHtml(v) : v)), // Sanitize XSS

  thoiGian: z
    .number()
    .int()
    .min(1, 'Thời gian nấu phải ít nhất 1 phút')
    .max(1440, 'Thời gian nấu không được quá 24 giờ')
    .optional(),

  khauPhan: z
    .number()
    .int()
    .min(1, 'Khẩu phần phải ít nhất 1 người')
    .max(100, 'Khẩu phần không được quá 100 người')
    .optional(),

  doKho: z
    .enum(['Dễ', 'Trung bình', 'Khó'])
    .optional(),

  danhMuc: z
    .string()
    .max(50, 'Danh mục không được quá 50 ký tự')
    .optional()
    .transform(v => (v ? sanitizeHtml(v) : v)),

  moTa: z
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự')
    .optional()
    .transform(v => (v ? sanitizeHtml(v) : v)),

  hinhAnh: z
    .string()
    .url('Đường dẫn ảnh không hợp lệ')
    .max(500)
    .optional(),
});

export type CreateRecipeDto = z.infer<typeof createRecipeSchema>;

// -------------------------------------------------------
// Schema cho hành động "Đã nấu xong" — trừ kho
// -------------------------------------------------------
export const cookRecipeSchema = z.object({
  soKhauPhan: z
    .number()
    .int()
    .min(1, 'Phải nấu ít nhất 1 khẩu phần')
    .max(100, 'Không thể nấu quá 100 khẩu phần cùng lúc')
    .default(1),

  maNhom: z
    .number()
    .int()
    .positive('Mã nhóm không hợp lệ'),
});

export type CookRecipeDto = z.infer<typeof cookRecipeSchema>;
