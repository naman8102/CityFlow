import express from 'express';
import { LogisticsController } from '../controllers/logisticsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/optimize', requireRole('LOGISTICS'), LogisticsController.optimizeFleetSchedule);
router.get('/trips', requireRole('LOGISTICS', 'POLICE'), LogisticsController.getAllTrips);
router.patch('/toggle-shift/:tripId', requireRole('LOGISTICS'), LogisticsController.toggleShiftState);

// Logistics AI Traffic Bridge (SIH Feature)
router.get('/traffic-correlation', LogisticsController.getTrafficCorrelation);
router.post('/apply-ai-shift', LogisticsController.applyAITimeShift);

export default router;

