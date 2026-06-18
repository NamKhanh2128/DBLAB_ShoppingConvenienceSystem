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
router.get('/audit-logs', ctrl.getAuditLogs.bind(ctrl));
router.get('/reports', ctrl.getReports.bind(ctrl));
router.post('/users/:id/reset-password', ctrl.resetPassword.bind(ctrl));
router.post('/cleanup-fake-users', ctrl.cleanupFakeUsers.bind(ctrl));

export default router;
