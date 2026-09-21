import express from 'express';
import { TrafficController } from '../controllers/trafficController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);
router.get('/observations', TrafficController.recent);
router.post('/snapshot', TrafficController.snapshot);
router.post('/sync/tomtom', requireRole('POLICE'), TrafficController.syncTomTom);
export default router;
