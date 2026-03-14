"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Protect all chat routes
router.post('/ai-doctor', chatController_1.aiDoctorChat);
router.get('/sessions', chatController_1.getSessions);
router.get('/sessions/:id', chatController_1.getSessionMessages);
exports.default = router;
