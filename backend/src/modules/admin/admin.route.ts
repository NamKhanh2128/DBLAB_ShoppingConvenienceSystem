import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authorizeRole } from '../../core/middleware/role.middleware';

const router = Router();
const ctrl = new AdminController();

router.use(authorizeRole(['ADMIN', 'MODERATOR']));

router.get('/dashboard', ctrl.getDashboard.bind(ctrl));
router.get('/users', ctrl.getUsers.bind(ctrl));
router.patch('/users/:id/status', ctrl.updateStatus.bind(ctrl));
router.patch('/users/:id/role', ctrl.updateRole.bind(ctrl));
router.delete('/users/:id', ctrl.deleteUser.bind(ctrl));

export default router;
