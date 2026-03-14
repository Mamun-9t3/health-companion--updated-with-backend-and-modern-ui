"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.logActivity = void 0;
const db_1 = __importDefault(require("../config/db"));
const logActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { type, amount, duration } = req.body;
        // type can be 'hydration', 'breathing', 'stretching'
        const activity = yield db_1.default.activityTracking.create({
            data: {
                userId,
                type,
                amount,
                duration,
            }
        });
        // Update Wellness Score simply logic
        // +1 for hydration glass
        // +5 for mindful breathing
        // +10 for stretching
        let pointsToAdd = 0;
        if (type === 'hydration')
            pointsToAdd = 1;
        if (type === 'breathing')
            pointsToAdd = 5;
        if (type === 'stretching')
            pointsToAdd = 10;
        let scoreRecord = yield db_1.default.wellnessScore.findFirst({
            where: { userId },
            orderBy: { calculatedAt: 'desc' }
        });
        let newScore = ((scoreRecord === null || scoreRecord === void 0 ? void 0 : scoreRecord.score) || 0) + pointsToAdd;
        yield db_1.default.wellnessScore.create({
            data: {
                userId,
                score: newScore
            }
        });
        res.status(201).json({ activity, newScore });
    }
    catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ message: 'Server error logging activity' });
    }
});
exports.logActivity = logActivity;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const activities = yield db_1.default.activityTracking.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        const currentScore = yield db_1.default.wellnessScore.findFirst({
            where: { userId },
            orderBy: { calculatedAt: 'desc' }
        });
        res.json({
            activities,
            score: (currentScore === null || currentScore === void 0 ? void 0 : currentScore.score) || 0
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});
exports.getStats = getStats;
