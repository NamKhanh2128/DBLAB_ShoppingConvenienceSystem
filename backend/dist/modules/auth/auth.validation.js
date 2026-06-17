"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Bảng chữ cái tiếng Việt Unicode đầy đủ (chữ hoa, chữ thường và dấu cách)
const vietnameseNameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠƯưăâđêôơư\s]+$/;
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Định dạng email không hợp lệ"),
        password: zod_1.z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự")
    })
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        hoTen: zod_1.z.string()
            .min(2, "Họ và tên phải có ít nhất 2 ký tự")
            .max(50, "Họ và tên không được vượt quá 50 ký tự")
            .regex(vietnameseNameRegex, "Họ và tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng")
            .transform(val => val.trim().replace(/\s+/g, ' ')), // Chuẩn hóa khoảng trắng thừa
        email: zod_1.z.string().email("Định dạng email không hợp lệ").max(100),
        password: zod_1.z.string()
            .min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
        soDienThoai: zod_1.z.string().max(20, "Số điện thoại quá dài").optional(),
        diaChi: zod_1.z.string().max(200, "Địa chỉ quá dài").optional()
    })
});
