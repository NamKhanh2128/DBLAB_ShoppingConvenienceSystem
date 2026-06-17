/**
 * family.route.ts
 * Khai báo routes và gắn Zod validation middleware.
 * Thứ tự route quan trọng: /join và /me phải đứng TRƯỚC /:groupId
 * để Express không nhầm "join"/"me" là groupId param.
 */
import { Router } from 'express';
import { FamilyController } from './family.controller';
import { validateRequest }  from '../../core/middleware/validate.middleware';
import {
  CreateFamilySchema,
  GenerateInviteSchema,
  JoinFamilySchema,
} from './family.dto';

const router = Router();
const ctrl   = new FamilyController();

import { requireGroupRole } from '../../core/middleware/role.middleware';

// ── Static routes (phải khai báo TRƯỚC /:groupId) ───────────────────────────
router.get( '/me',   ctrl.getMyFamilies.bind(ctrl));
router.post('/',     validateRequest(CreateFamilySchema), ctrl.create.bind(ctrl));
router.post('/join', validateRequest(JoinFamilySchema),   ctrl.joinFamily.bind(ctrl));

// ── Dynamic routes ───────────────────────────────────────────────────────────
router.get('/:groupId/members',                   requireGroupRole(['LEADER', 'MEMBER']), ctrl.getMembers.bind(ctrl));
router.get('/:groupId/invites',                   requireGroupRole(['LEADER', 'MEMBER']), ctrl.getInvites.bind(ctrl));
router.post('/:groupId/invites',                 requireGroupRole(['LEADER']), validateRequest(GenerateInviteSchema), ctrl.generateInvite.bind(ctrl));
router.put('/:groupId/members/:userId',          requireGroupRole(['LEADER']), ctrl.updateMember.bind(ctrl));
router.patch('/:groupId/members/:userId/role',   requireGroupRole(['LEADER']), ctrl.updateMemberRole.bind(ctrl));
router.delete('/:groupId/members/:userId',       requireGroupRole(['LEADER', 'MEMBER']), ctrl.removeMember.bind(ctrl));
router.delete('/:groupId/invites/:inviteId',     requireGroupRole(['LEADER']), ctrl.revokeInvite.bind(ctrl));

// Nâng cấp bảo mật & UX mới
router.put('/:groupId/transfer-leadership',      requireGroupRole(['LEADER']), ctrl.transferLeadership.bind(ctrl));
router.put('/:groupId/info',                     requireGroupRole(['LEADER']), ctrl.updateFamilyInfo.bind(ctrl));
router.get('/:groupId/notifications',            requireGroupRole(['LEADER', 'MEMBER']), ctrl.getNotifications.bind(ctrl));

export default router;
