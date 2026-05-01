/**
 * family.dto.ts
 * Zod v4 schemas — validate & parse request input ở tầng HTTP.
 * Single Source of Truth cho shape của request body/params/query.
 */
import { z } from 'zod';

// ─── CREATE FAMILY ──────────────────────────────────────────────────────────
export const CreateFamilySchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Tên nhóm không được để trống hoặc sai định dạng' })
      .min(2, 'Tên nhóm tối thiểu 2 ký tự')
      .max(100, 'Tên nhóm tối đa 100 ký tự')
      .trim(),
    description: z.string().max(500, 'Mô tả tối đa 500 ký tự').trim().optional(),
    // maxMembers: 2–50, default 10
    maxMembers: z.number({ error: 'maxMembers phải là số' }).int().min(2).max(50).optional(),
  }),
});

// ─── GENERATE INVITE ────────────────────────────────────────────────────────
export const GenerateInviteSchema = z.object({
  params: z.object({
    // Nhận groupId dạng string từ URL params, parse sang number
    groupId: z
      .string({ error: 'Thiếu groupId trên URL' })
      .regex(/^\d+$/, 'groupId phải là số nguyên dương')
      .transform(Number),
  }),
  body: z.object({
    // maxUses: 1–100 lần sử dụng, default = 1 (single-use)
    maxUses: z.number({ error: 'maxUses phải là số' }).int().min(1).max(100).optional(),
  }),
});

// ─── JOIN FAMILY ────────────────────────────────────────────────────────────
export const JoinFamilySchema = z.object({
  body: z.object({
    // Mã mời: đúng 8 ký tự, uppercase để tránh ambiguity
    inviteCode: z
      .string({
        error: (issue) =>
          issue.input === undefined ? 'Mã mời không được để trống' : 'Mã mời phải là chuỗi',
      })
      .length(8, 'Mã mời phải có đúng 8 ký tự')
      .toUpperCase(),
  }),
});

// ─── INFERRED TYPES (dùng trong Service/Controller) ─────────────────────────
export type CreateFamilyDto = z.infer<typeof CreateFamilySchema>['body'];
export type GenerateInviteDto = z.infer<typeof GenerateInviteSchema>['body'];
export type JoinFamilyDto = z.infer<typeof JoinFamilySchema>['body'];