"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFoodSchema = exports.addFoodSchema = void 0;
const zod_1 = require("zod");
exports.addFoodSchema = zod_1.z.object({
    maNhom: zod_1.z.number().int().positive('Mã nhóm phải là số nguyên dương'),
    tenTP: zod_1.z.string()
        .min(2, 'Tên thực phẩm phải có ít nhất 2 ký tự')
        .max(100, 'Tên thực phẩm không được vượt quá 100 ký tự'),
    soLuong: zod_1.z.number()
        .nonnegative('Số lượng không được âm')
        .max(999999, 'Số lượng quá lớn (tối đa 999,999)'),
    donVi: zod_1.z.string().optional().or(zod_1.z.null()).transform((val) => val || 'cái'),
    hanSuDung: zod_1.z.string().nullable().optional().refine(val => {
        if (!val)
            return true;
        const d = new Date(val);
        return !isNaN(d.getTime());
    }, { message: 'Hạn sử dụng phải là định dạng ngày hợp lệ (YYYY-MM-DD)' }),
    viTri: zod_1.z.string().max(100, 'Vị trí không được dài quá 100 ký tự').nullable().optional()
});
exports.updateFoodSchema = zod_1.z.object({
    soLuong: zod_1.z.number()
        .nonnegative('Số lượng không được âm')
        .max(999999, 'Số lượng quá lớn (tối đa 999,999)'),
    trangThai: zod_1.z.enum(['CON_HAN', 'HE_HAN', 'HONG']).optional(),
    viTri: zod_1.z.string().max(100, 'Vị trí không được dài quá 100 ký tự').nullable().optional(),
    version: zod_1.z.number()
        .int()
        .positive('Version phải là số nguyên dương')
});
