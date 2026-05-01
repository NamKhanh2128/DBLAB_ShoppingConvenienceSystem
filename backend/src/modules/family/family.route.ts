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

// ── Static routes (phải khai báo TRƯỚC /:groupId) ───────────────────────────
router.get( '/me',   ctrl.getMyFamilies.bind(ctrl));
router.post('/',     validateRequest(CreateFamilySchema), ctrl.create.bind(ctrl));
router.post('/join', validateRequest(JoinFamilySchema),   ctrl.joinFamily.bind(ctrl));

// ── Dynamic routes ───────────────────────────────────────────────────────────
router.get('/groupId/members',                   ctrl.getMembers.bind(ctrl));
router.get('/groupId/invites',                   ctrl.getInvites.bind(ctrl));
router.post('/:groupId/invites',                 validateRequest(GenerateInviteSchema), ctrl.generateInvite.bind(ctrl));
router.delete('/:groupId/members/:userId',       ctrl.removeMember.bind(ctrl));
router.delete('/:groupId/invites/:inviteId',     ctrl.revokeInvite.bind(ctrl));

export default router;
