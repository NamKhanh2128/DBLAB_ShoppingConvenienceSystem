import { Router } from 'express';
import { UsersController } from './users.controller';

const router = Router();
const ctrl = new UsersController();

// Self-service (authenticated user acts on own account)
router.put('/profile', ctrl.updateProfile.bind(ctrl));
router.put('/change-password', ctrl.changePassword.bind(ctrl));

// Admin actions
router.get('/', ctrl.getAll.bind(ctrl));
router.get('/stats', ctrl.getStats.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.patch('/:id/role', ctrl.updateRole.bind(ctrl));
router.patch('/:id/status', ctrl.updateStatus.bind(ctrl));
router.delete('/:id', ctrl.deleteUser.bind(ctrl));

export default router;
