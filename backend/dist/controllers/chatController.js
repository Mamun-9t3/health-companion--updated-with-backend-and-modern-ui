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
exports.getSessionMessages = exports.getSessions = exports.aiDoctorChat = void 0;
const genai_1 = require("@google/genai");
const db_1 = __importDefault(require("../config/db"));
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
const EMERGENCY_KEYWORDS = [
    'chest pain',
    'stroke',
    'difficulty breathing',
    'severe bleeding',
    'heart attack',
    'cant breath',
    'can not breath'
];
const aiDoctorChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId, message } = req.body;
        const userId = req.user.userId; // from auth middleware
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const newSession = yield db_1.default.chatSession.create({
                data: {
                    userId,
                    title: message.substring(0, 50) + '...',
                }
            });
            currentSessionId = newSession.id;
        }
        // Save user message
        yield db_1.default.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: 'user',
                content: message,
            }
        });
        // Check emergency
        const lowerMessage = message.toLowerCase();
        const isEmergency = EMERGENCY_KEYWORDS.some(kw => lowerMessage.includes(kw));
        if (isEmergency) {
            yield db_1.default.chatMessage.create({
                data: {
                    sessionId: currentSessionId,
                    role: 'ai',
                    content: '[EMERGENCY] SEEK IMMEDIATE MEDICAL ATTENTION. Call your local emergency number or proceed to the nearest hospital immediately.',
                    isEmergency: true
                }
            });
            return res.json({
                sessionId: currentSessionId,
                reply: '[EMERGENCY] SEEK IMMEDIATE MEDICAL ATTENTION. Call your local emergency number or proceed to the nearest hospital immediately.',
                isEmergency: true
            });
        }
        // Get chat history
        const history = yield db_1.default.chatMessage.findMany({
            where: { sessionId: currentSessionId },
            orderBy: { createdAt: 'asc' },
            take: 10
        });
        const systemInstruction = 'You are an AI health assistant for Health Companion app. You CANNOT and MUST NOT diagnose diseases. Provide general health guidance only. Encourage consulting a medical professional. If the user mentions extreme pain or severe symptoms, warn them to seek emergency care.';
        // Format history for Gemini (roles: 'user' or 'model')
        const formattedHistory = history.map((m) => ({
            role: m.role === 'ai' || m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        // Add current user message
        formattedHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });
        let aiReply = '';
        try {
            const response = yield ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: formattedHistory,
                config: {
                    systemInstruction: systemInstruction
                }
            });
            aiReply = response.text || 'I am sorry, I am unable to process that at the moment.';
        }
        catch (err) {
            console.error('Gemini API Error', err);
            aiReply = 'I am currently experiencing technical difficulties. Please consult a healthcare professional for advice.';
        }
        // Check if AI determined an emergency
        const aiEmergency = aiReply.includes('[EMERGENCY]');
        yield db_1.default.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: 'ai',
                content: aiReply,
                isEmergency: aiEmergency
            }
        });
        res.json({
            sessionId: currentSessionId,
            reply: aiReply,
            isEmergency: aiEmergency
        });
    }
    catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Server error processing chat' });
    }
});
exports.aiDoctorChat = aiDoctorChat;
const getSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const sessions = yield db_1.default.chatSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching sessions' });
    }
});
exports.getSessions = getSessions;
const getSessionMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const session = yield db_1.default.chatSession.findUnique({
            where: { id: id }
        });
        if (!session || session.userId !== userId) {
            return res.status(404).json({ message: 'Session not found' });
        }
        const messages = yield db_1.default.chatMessage.findMany({
            where: { sessionId: id },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ session, messages });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});
exports.getSessionMessages = getSessionMessages;
