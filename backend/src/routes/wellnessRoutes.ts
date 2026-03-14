import { Router } from 'express';
import { logActivity, getStats } from '../controllers/wellnessController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/activity', logActivity);
router.get('/stats', getStats);

export default router;
