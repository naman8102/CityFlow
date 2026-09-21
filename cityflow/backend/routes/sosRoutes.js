import express from 'express';
import { SosController } from '../controllers/sosController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Real-Time Server-Sent Events stream
router.get('/stream', SosController.streamEvents);

// Special Case Citizen endpoints
router.post('/request', requireAuth, SosController.createRequest);
router.get('/my-status', requireAuth, SosController.getMyStatus);

// Police Command Hub endpoints
router.get('/requests', requireAuth, requireRole('POLICE'), SosController.getAllRequests);
router.post('/:id/verify', requireAuth, requireRole('POLICE'), SosController.verifyRequest);
router.post('/:id/proceed', requireAuth, requireRole('POLICE'), SosController.proceedRequest);
router.post('/:id/activate-vip', requireAuth, requireRole('POLICE'), SosController.activateVipRequest);
router.post('/:id/resolve', requireAuth, requireRole('POLICE'), SosController.resolveRequest);

export default router;
