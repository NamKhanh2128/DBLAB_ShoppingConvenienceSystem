import { Router } from 'express';
import { MealPlanController } from './meal-plan.controller';

const router = Router();
const ctrl = new MealPlanController();

router.get('/', ctrl.getByDateRange.bind(ctrl));
router.get('/today', ctrl.getToday.bind(ctrl));
router.get('/check-ingredients', ctrl.checkIngredients.bind(ctrl));

router.post('/', ctrl.create.bind(ctrl));
router.post('/add-missing-to-shopping', ctrl.addMissingToShopping.bind(ctrl));
router.post('/copy-range', ctrl.copyRange.bind(ctrl));

router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.remove.bind(ctrl));

export default router;
