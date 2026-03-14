import { Router } from 'express';
import { aiDoctorChat, getSessions, getSessionMessages } from '../controllers/chatController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect all chat routes

router.post('/message', aiDoctorChat);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionMessages);

export default router;
