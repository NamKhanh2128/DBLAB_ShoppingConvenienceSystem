import { Router } from 'express';
import { MealPlanController } from './meal-plan.controller';

const router = Router();
const ctrl = new MealPlanController();

router.get('/', ctrl.get.bind(ctrl));
router.get('/today', ctrl.getToday.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.remove.bind(ctrl));

export default router;
