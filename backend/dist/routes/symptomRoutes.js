"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const symptomController_1 = require("../controllers/symptomController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Protect routes
router.post('/check', symptomController_1.checkSymptoms);
exports.default = router;
