import express from 'express';
import { EmergencyController } from '../controllers/emergencyController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/dispatch', requireRole('POLICE'), EmergencyController.dispatchMission);
router.get('/active', EmergencyController.getActiveMissions);
router.post('/clear/:missionId', requireRole('POLICE'), EmergencyController.clearMission);

export default router;
