import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import userRoutes from '../modules/users/users.route';
import familyRoutes from '../modules/family/family.route';
import shoppingRoutes from '../modules/shopping/shopping.route';
import inventoryRoutes from '../modules/inventory/inventory.route';
import recipesRoutes from '../modules/recipes/recipes.route';
import mealPlanRoutes from '../modules/meal-plan/meal-plan.route';
import reportRoutes from '../modules/reports/reports.route';
import adminRoutes from '../modules/admin/admin.route';
import { authenticate } from '../core/middleware/auth.middleware';

const router = Router();

// ── Public ──
router.use('/auth', authRoutes);

// ── Protected (require JWT) ──
router.use('/users', authenticate, userRoutes);
router.use('/family', authenticate, familyRoutes);
router.use('/shopping', authenticate, shoppingRoutes);
router.use('/inventory', authenticate, inventoryRoutes);
router.use('/recipes', authenticate, recipesRoutes);
router.use('/meal-plan', authenticate, mealPlanRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/admin', authenticate, adminRoutes);

export default router;
