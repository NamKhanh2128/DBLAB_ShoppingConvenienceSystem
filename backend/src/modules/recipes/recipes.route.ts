import { Router } from 'express';
import { RecipesController } from './recipes.controller';

const router = Router();
const ctrl = new RecipesController();

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.remove.bind(ctrl));

export default router;
