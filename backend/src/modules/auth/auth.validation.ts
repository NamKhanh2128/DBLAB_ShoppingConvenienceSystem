import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
  })
});

export const registerSchema = z.object({
  body: z.object({
    hoTen: z.string().min(2, "Name is too short").max(100),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    soDienThoai: z.string().optional(),
    diaChi: z.string().optional()
  })
});
