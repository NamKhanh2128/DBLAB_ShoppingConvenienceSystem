import { z } from 'zod';

export const createMealPlanSchema = z.object({
  maNhom: z.number().int().positive('Mã nhóm phải là số nguyên dương'),
  ngay: z.string().refine(val => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    // Buffer 1 ngày để tránh reject nhầm khi server UTC < UTC+7 của user (0:00-7:00 AM VN)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d.getTime() >= yesterday.getTime();
  }, { message: 'Kế hoạch bữa ăn không được đặt trong quá khứ' }),
  buoi: z.enum(['SANG', 'TRUA', 'TOI', 'PHU']),
  maMon: z.number().int().positive('Mã món ăn phải là số nguyên dương'),
  ghiChu: z.string().max(255, 'Ghi chú tối đa 255 ký tự').nullable().optional(),
  soKhauPhan: z.number().int().positive('Số khẩu phần phải là số nguyên dương').max(100, 'Số khẩu phần quá lớn (tối đa 100)').default(4)
});

export const updateMealPlanSchema = z.object({
  maMon: z.number().int().positive('Mã món ăn phải là số nguyên dương'),
  ghiChu: z.string().max(255, 'Ghi chú tối đa 255 ký tự').nullable().optional(),
  soKhauPhan: z.number().int().positive('Số khẩu phần phải là số nguyên dương').max(100, 'Số khẩu phần quá lớn (tối đa 100)')
});
