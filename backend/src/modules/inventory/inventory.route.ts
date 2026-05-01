import { Router } from 'express';
import { InventoryController } from './inventory.controller';

const router = Router();
const ctrl = new InventoryController();

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/expiring', ctrl.getExpiring.bind(ctrl));
router.post('/', ctrl.add.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.remove.bind(ctrl));

export default router;
