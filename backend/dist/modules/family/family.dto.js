"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinFamilySchema = exports.GenerateInviteSchema = exports.CreateFamilySchema = void 0;
/**
 * family.dto.ts
 * Zod v4 schemas — validate & parse request input ở tầng HTTP.
 * Single Source of Truth cho shape của request body/params/query.
 */
const zod_1 = require("zod");
// ─── CREATE FAMILY ──────────────────────────────────────────────────────────
exports.CreateFamilySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({ error: 'Tên nhóm không được để trống hoặc sai định dạng' })
            .min(2, 'Tên nhóm tối thiểu 2 ký tự')
            .max(100, 'Tên nhóm tối đa 100 ký tự')
            .trim(),
        description: zod_1.z.string().max(500, 'Mô tả tối đa 500 ký tự').trim().optional(),
        // maxMembers: 2–50, default 10
        maxMembers: zod_1.z.number({ error: 'maxMembers phải là số' }).int().min(2).max(50).optional(),
    }),
});
// ─── GENERATE INVITE ────────────────────────────────────────────────────────
exports.GenerateInviteSchema = zod_1.z.object({
    params: zod_1.z.object({
        // Nhận groupId dạng string từ URL params, parse sang number
        groupId: zod_1.z
            .string({ error: 'Thiếu groupId trên URL' })
            .regex(/^\d+$/, 'groupId phải là số nguyên dương')
            .transform(Number),
    }),
    body: zod_1.z.object({
        // maxUses: 1–100 lần sử dụng, default = 1 (single-use)
        maxUses: zod_1.z.number({ error: 'maxUses phải là số' }).int().min(1).max(100).optional(),
    }),
});
// ─── JOIN FAMILY ────────────────────────────────────────────────────────────
exports.JoinFamilySchema = zod_1.z.object({
    body: zod_1.z.object({
        // Mã mời: đúng 8 ký tự, uppercase để tránh ambiguity
        inviteCode: zod_1.z
            .string({
            error: (issue) => issue.input === undefined ? 'Mã mời không được để trống' : 'Mã mời phải là chuỗi',
        })
            .length(8, 'Mã mời phải có đúng 8 ký tự')
            .toUpperCase(),
    }),
});
