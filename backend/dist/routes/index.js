"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("../modules/auth/auth.route"));
const users_route_1 = __importDefault(require("../modules/users/users.route"));
const family_route_1 = __importDefault(require("../modules/family/family.route"));
const shopping_route_1 = __importDefault(require("../modules/shopping/shopping.route"));
const inventory_route_1 = __importDefault(require("../modules/inventory/inventory.route"));
const recipes_route_1 = __importDefault(require("../modules/recipes/recipes.route"));
const meal_plan_route_1 = __importDefault(require("../modules/meal-plan/meal-plan.route"));
const reports_route_1 = __importDefault(require("../modules/reports/reports.route"));
const admin_route_1 = __importDefault(require("../modules/admin/admin.route"));
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// ── Public ──
router.use('/auth', auth_route_1.default);
// ── Protected (require JWT) ──
router.use('/users', auth_middleware_1.authenticate, users_route_1.default);
router.use('/family', auth_middleware_1.authenticate, family_route_1.default);
router.use('/shopping', auth_middleware_1.authenticate, shopping_route_1.default);
router.use('/inventory', auth_middleware_1.authenticate, inventory_route_1.default);
router.use('/recipes', auth_middleware_1.authenticate, recipes_route_1.default);
router.use('/meal-plan', auth_middleware_1.authenticate, meal_plan_route_1.default);
router.use('/reports', auth_middleware_1.authenticate, reports_route_1.default);
router.use('/admin', auth_middleware_1.authenticate, admin_route_1.default);
exports.default = router;
