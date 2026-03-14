"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hospitalController_1 = require("../controllers/hospitalController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Protect routes
router.get('/nearby', hospitalController_1.getNearbyHospitals);
exports.default = router;
