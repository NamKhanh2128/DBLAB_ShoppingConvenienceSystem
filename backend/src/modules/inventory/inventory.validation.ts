import { z } from 'zod';
import { STANDARD_UNITS } from './inventory.utils';

export const addFoodSchema = z.object({
  maNhom: z.number({ required_error: 'Mã nhóm là bắt buộc' }).int().positive('Mã nhóm phải là số nguyên dương'),
  tenTP: z.string({ required_error: 'Tên thực phẩm là bắt buộc' })
    .min(2, 'Tên thực phẩm phải có ít nhất 2 ký tự')
    .max(100, 'Tên thực phẩm không được vượt quá 100 ký tự'),
  soLuong: z.number({ required_error: 'Số lượng là bắt buộc' })
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
  soLuong: z.number({ required_error: 'Số lượng là bắt buộc' })
    .nonnegative('Số lượng không được âm')
    .max(999999, 'Số lượng quá lớn (tối đa 999,999)'),
  trangThai: z.enum(['CON_HAN', 'HE_HAN', 'HONG'], {
    errorMap: () => ({ message: 'Trạng thái phải là CON_HAN, HE_HAN hoặc HONG' })
  }).optional(),
  viTri: z.string().max(100, 'Vị trí không được dài quá 100 ký tự').nullable().optional(),
  version: z.number({ required_error: 'Version của thực phẩm là bắt buộc để kiểm soát xung đột OCC' })
    .int()
    .positive('Version phải là số nguyên dương')
});
