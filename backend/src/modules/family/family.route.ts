import { Router } from 'express';
import { FamilyController } from './family.controller';

const router = Router();
const ctrl = new FamilyController();

router.get('/me', ctrl.getMyFamilies.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.get('/:id/members', ctrl.getMembers.bind(ctrl));
router.post('/:id/members', ctrl.addMember.bind(ctrl));
router.delete('/:id/members/:userId', ctrl.removeMember.bind(ctrl));

export default router;
