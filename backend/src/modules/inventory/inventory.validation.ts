import { z } from 'zod';

export const addFoodSchema = z.object({
  maNhom: z.number().int().positive('Mã nhóm phải là số nguyên dương'),
  tenTP: z.string()
    .min(2, 'Tên thực phẩm phải có ít nhất 2 ký tự')
    .max(100, 'Tên thực phẩm không được vượt quá 100 ký tự'),
  soLuong: z.number()
    .nonnegative('Số lượng không được âm')
    .max(999999, 'Số lượng quá lớn (tối đa 999,999)'),
  donVi: z.string().optional().or(z.null()).transform((val) => val || 'cái'),
  hanSuDung: z.string().nullable().optional().refine(val => {
    if (!val) return true;
    const d = new Date(val);
    return !isNaN(d.getTime());
  }, { message: 'Hạn sử dụng phải là định dạng ngày hợp lệ (YYYY-MM-DD)' }),
  viTri: z.string().max(100, 'Vị trí không được dài quá 100 ký tự').nullable().optional()
});

export const updateFoodSchema = z.object({
  soLuong: z.number()
    .nonnegative('Số lượng không được âm')
    .max(999999, 'Số lượng quá lớn (tối đa 999,999)'),
  tenTP: z.string()
    .min(2, 'Tên thực phẩm phải có ít nhất 2 ký tự')
    .max(100, 'Tên thực phẩm không được vượt quá 100 ký tự')
    .optional(),
  hanSuDung: z.string().nullable().optional().refine(val => {
    if (!val) return true;
    const d = new Date(val);
    return !isNaN(d.getTime());
  }, { message: 'Hạn sử dụng phải là định dạng ngày hợp lệ (YYYY-MM-DD)' }),
  donVi: z.string().max(50, 'Đơn vị không được dài quá 50 ký tự').nullable().optional(),
  trangThai: z.enum(['CON_HAN', 'HET_HAN']).optional(),
  viTri: z.string().max(100, 'Vị trí không được dài quá 100 ký tự').nullable().optional(),
  version: z.number()
    .int()
    .positive('Version phải là số nguyên dương')
});
