import { Router } from 'express';
import { RecipesController } from './recipes.controller';

const router = Router();
const ctrl = new RecipesController();

// Gợi ý công thức theo kho — phải đặt TRƯỚC /:id để tránh conflict
router.get('/suggest', ctrl.suggest.bind(ctrl));

// CRUD cơ bản
router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.remove.bind(ctrl));

// "Đã nấu xong" — trừ nguyên liệu trong kho
router.post('/:id/cook', ctrl.cook.bind(ctrl));

export default router;
