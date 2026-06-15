"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * family.route.ts
 * Khai báo routes và gắn Zod validation middleware.
 * Thứ tự route quan trọng: /join và /me phải đứng TRƯỚC /:groupId
 * để Express không nhầm "join"/"me" là groupId param.
 */
const express_1 = require("express");
const family_controller_1 = require("./family.controller");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const family_dto_1 = require("./family.dto");
const router = (0, express_1.Router)();
const ctrl = new family_controller_1.FamilyController();
const role_middleware_1 = require("../../core/middleware/role.middleware");
// ── Static routes (phải khai báo TRƯỚC /:groupId) ───────────────────────────
router.get('/me', ctrl.getMyFamilies.bind(ctrl));
router.post('/', (0, validate_middleware_1.validateRequest)(family_dto_1.CreateFamilySchema), ctrl.create.bind(ctrl));
router.post('/join', (0, validate_middleware_1.validateRequest)(family_dto_1.JoinFamilySchema), ctrl.joinFamily.bind(ctrl));
// ── Dynamic routes ───────────────────────────────────────────────────────────
router.get('/:groupId/members', (0, role_middleware_1.requireGroupRole)(['LEADER', 'MEMBER']), ctrl.getMembers.bind(ctrl));
router.get('/:groupId/invites', (0, role_middleware_1.requireGroupRole)(['LEADER', 'MEMBER']), ctrl.getInvites.bind(ctrl));
router.post('/:groupId/invites', (0, role_middleware_1.requireGroupRole)(['LEADER']), (0, validate_middleware_1.validateRequest)(family_dto_1.GenerateInviteSchema), ctrl.generateInvite.bind(ctrl));
router.delete('/:groupId/members/:userId', (0, role_middleware_1.requireGroupRole)(['LEADER', 'MEMBER']), ctrl.removeMember.bind(ctrl));
router.delete('/:groupId/invites/:inviteId', (0, role_middleware_1.requireGroupRole)(['LEADER']), ctrl.revokeInvite.bind(ctrl));
// Nâng cấp bảo mật & UX mới
router.put('/:groupId/transfer-leadership', (0, role_middleware_1.requireGroupRole)(['LEADER']), ctrl.transferLeadership.bind(ctrl));
router.put('/:groupId/info', (0, role_middleware_1.requireGroupRole)(['LEADER']), ctrl.updateFamilyInfo.bind(ctrl));
router.get('/:groupId/notifications', (0, role_middleware_1.requireGroupRole)(['LEADER', 'MEMBER']), ctrl.getNotifications.bind(ctrl));
exports.default = router;
