import { Router } from 'express';
import { getNearbyHospitals } from '../controllers/hospitalController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect routes

router.get('/nearby', getNearbyHospitals);

export default router;
