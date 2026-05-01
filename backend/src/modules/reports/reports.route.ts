import { Router } from 'express';
import { ReportsController } from './reports.controller';

const router = Router();
const ctrl = new ReportsController();

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/summary', ctrl.getSummary.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));

export default router;
