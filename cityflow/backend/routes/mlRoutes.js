import express from 'express';
import { MlController } from '../controllers/mlController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/status', MlController.getStatus);
router.post('/predict-congestion', requireRole('POLICE', 'LOGISTICS'), MlController.predictCongestion);
router.post('/predict-fuel', requireRole('LOGISTICS'), MlController.predictFuel);
router.post('/evaluate-routes', requireRole('POLICE', 'LOGISTICS'), MlController.evaluateRoutes);

export default router;
