"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
const ctrl = new users_controller_1.UsersController();
// Self-service (authenticated user acts on own account)
router.put('/profile', ctrl.updateProfile.bind(ctrl));
router.put('/change-password', ctrl.changePassword.bind(ctrl));
// Admin actions
router.get('/', ctrl.getAll.bind(ctrl));
router.get('/stats', ctrl.getStats.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.patch('/:id/role', ctrl.updateRole.bind(ctrl));
router.patch('/:id/status', ctrl.updateStatus.bind(ctrl));
router.delete('/:id', ctrl.deleteUser.bind(ctrl));
exports.default = router;
