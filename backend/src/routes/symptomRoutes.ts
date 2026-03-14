import { Router } from 'express';
import { checkSymptoms } from '../controllers/symptomController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect routes

router.post('/check', checkSymptoms);

export default router;
