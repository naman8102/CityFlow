import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.get('/status', AuthController.status);
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', requireAuth, AuthController.changePassword);
router.get('/history', requireAuth, AuthController.history);
export default router;
