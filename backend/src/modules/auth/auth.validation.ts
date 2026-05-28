import { z } from 'zod';

// Bảng chữ cái tiếng Việt Unicode đầy đủ (chữ hoa, chữ thường và dấu cách)
const vietnameseNameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠƯưăâđêôơư\s]+$/;

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Định dạng email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
  })
});

export const registerSchema = z.object({
  body: z.object({
    hoTen: z.string()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự")
      .max(50, "Họ và tên không được vượt quá 50 ký tự")
      .regex(vietnameseNameRegex, "Họ và tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng")
      .transform(val => val.trim().replace(/\s+/g, ' ')), // Chuẩn hóa khoảng trắng thừa
    email: z.string().email("Định dạng email không hợp lệ").max(100),
    password: z.string()
      .min(8, "Mật khẩu phải dài ít nhất 8 ký tự")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số"),
    soDienThoai: z.string().max(20, "Số điện thoại quá dài").optional(),
    diaChi: z.string().max(200, "Địa chỉ quá dài").optional()
  })
});
