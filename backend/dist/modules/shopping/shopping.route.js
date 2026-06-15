"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shopping_controller_1 = require("./shopping.controller");
const router = (0, express_1.Router)();
const ctrl = new shopping_controller_1.ShoppingController();
// ── Lists ──────────────────────────────────────────────────────────
router.get('/lists', ctrl.getLists.bind(ctrl));
router.post('/lists', ctrl.createList.bind(ctrl));
router.patch('/lists/:id/status', ctrl.updateStatus.bind(ctrl));
router.delete('/lists/:id', ctrl.deleteList.bind(ctrl));
// ── Special operations (phải đặt TRƯỚC /:id/items để tránh conflict)
router.post('/lists/:id/complete-and-restock', ctrl.completeAndRestock.bind(ctrl));
router.post('/lists/:id/merge-duplicates', ctrl.mergeDuplicates.bind(ctrl));
// ── Items ──────────────────────────────────────────────────────────
router.get('/lists/:id/items', ctrl.getItems.bind(ctrl));
router.post('/lists/:id/items', ctrl.addItem.bind(ctrl));
router.patch('/items/:itemId/toggle', ctrl.toggleItem.bind(ctrl));
router.put('/items/:itemId', ctrl.updateItem.bind(ctrl));
router.delete('/items/:itemId', ctrl.deleteItem.bind(ctrl));
exports.default = router;
