"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recipes_controller_1 = require("./recipes.controller");
const router = (0, express_1.Router)();
const ctrl = new recipes_controller_1.RecipesController();
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
exports.default = router;
