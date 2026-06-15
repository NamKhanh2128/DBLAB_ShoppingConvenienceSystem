"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListSchema = exports.updateItemSchema = exports.addItemSchema = void 0;
const zod_1 = require("zod");
// -------------------------------------------------------
// Schema thêm item vào danh sách mua sắm
// -------------------------------------------------------
exports.addItemSchema = zod_1.z.object({
    tenThucPham: zod_1.z
        .string()
        .min(1, 'Tên thực phẩm không được để trống')
        .max(100, 'Tên thực phẩm không được quá 100 ký tự')
        .transform(v => v.trim()),
    soLuong: zod_1.z
        .number()
        .positive('Số lượng phải lớn hơn 0')
        .max(9999, 'Số lượng không được vượt quá 9,999'),
    donVi: zod_1.z
        .string()
        .max(20, 'Đơn vị không được quá 20 ký tự')
        .optional()
        .transform(v => v?.trim() || null),
    giaDuKien: zod_1.z
        .number()
        .min(0, 'Giá dự kiến không được âm')
        .max(999_999_999, 'Giá dự kiến quá lớn')
        .optional()
        .default(0),
    giaThucTe: zod_1.z
        .number()
        .min(0, 'Giá thực tế không được âm')
        .max(999_999_999, 'Giá thực tế quá lớn')
        .optional()
        .default(0),
    danhMucHang: zod_1.z
        .string()
        .max(50, 'Danh mục không được quá 50 ký tự')
        .optional()
        .transform(v => v?.trim() || null),
    nguoiPhuTrach: zod_1.z.number().int().positive().nullable().optional(),
});
// -------------------------------------------------------
// Schema cập nhật item
// -------------------------------------------------------
exports.updateItemSchema = zod_1.z.object({
    tenThucPham: zod_1.z
        .string()
        .min(1, 'Tên thực phẩm không được để trống')
        .max(100)
        .transform(v => v.trim())
        .optional(),
    soLuong: zod_1.z
        .number()
        .positive('Số lượng phải lớn hơn 0')
        .max(9999)
        .optional(),
    donVi: zod_1.z.string().max(20).optional().transform(v => v?.trim() || null),
    giaDuKien: zod_1.z.number().min(0).max(999_999_999).optional(),
    giaThucTe: zod_1.z.number().min(0).max(999_999_999).optional(),
    danhMucHang: zod_1.z.string().max(50).optional().transform(v => v?.trim() || null),
});
// -------------------------------------------------------
// Schema tạo danh sách mua sắm
// -------------------------------------------------------
exports.createListSchema = zod_1.z.object({
    maNhom: zod_1.z.number().int().positive('Mã nhóm không hợp lệ'),
    ghiChu: zod_1.z
        .string()
        .max(255, 'Ghi chú không được quá 255 ký tự')
        .optional()
        .transform(v => v?.trim() || null),
});
