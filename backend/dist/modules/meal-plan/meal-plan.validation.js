"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMealPlanSchema = exports.createMealPlanSchema = void 0;
const zod_1 = require("zod");
exports.createMealPlanSchema = zod_1.z.object({
    maNhom: zod_1.z.number().int().positive('Mã nhóm phải là số nguyên dương'),
    ngay: zod_1.z.string().refine(val => {
        const d = new Date(val);
        if (isNaN(d.getTime()))
            return false;
        // Đưa về cùng múi giờ để so sánh chính xác ngày hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d.getTime() >= today.getTime();
    }, { message: 'Kế hoạch bữa ăn không được đặt trong quá khứ' }),
    buoi: zod_1.z.enum(['SANG', 'TRUA', 'TOI']),
    maMon: zod_1.z.number().int().positive('Mã món ăn phải là số nguyên dương'),
    ghiChu: zod_1.z.string().max(255, 'Ghi chú tối đa 255 ký tự').nullable().optional(),
    soKhauPhan: zod_1.z.number().int().positive('Số khẩu phần phải là số nguyên dương').max(100, 'Số khẩu phần quá lớn (tối đa 100)').default(4)
});
exports.updateMealPlanSchema = zod_1.z.object({
    maMon: zod_1.z.number().int().positive('Mã món ăn phải là số nguyên dương'),
    ghiChu: zod_1.z.string().max(255, 'Ghi chú tối đa 255 ký tự').nullable().optional(),
    soKhauPhan: zod_1.z.number().int().positive('Số khẩu phần phải là số nguyên dương').max(100, 'Số khẩu phần quá lớn (tối đa 100)')
});
