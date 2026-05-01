import { Router } from 'express';
import { ShoppingController } from './shopping.controller';

const router = Router();
const ctrl = new ShoppingController();

// Lists
router.get('/lists', ctrl.getLists.bind(ctrl));
router.post('/lists', ctrl.createList.bind(ctrl));
router.patch('/lists/:id/status', ctrl.updateStatus.bind(ctrl));
router.delete('/lists/:id', ctrl.deleteList.bind(ctrl));

// Items
router.get('/lists/:id/items', ctrl.getItems.bind(ctrl));
router.post('/lists/:id/items', ctrl.addItem.bind(ctrl));
router.patch('/items/:itemId/toggle', ctrl.toggleItem.bind(ctrl));
router.put('/items/:itemId', ctrl.updateItem.bind(ctrl));
router.delete('/items/:itemId', ctrl.deleteItem.bind(ctrl));

export default router;
