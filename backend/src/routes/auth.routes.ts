import { Router } from 'express';
import { login, setupVault, verifyVault, changePassword, resetPin, signup, requestSignupOtp, me, logout, requestPasswordResetOtp, resetPasswordWithOtp } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { refreshToken } from '../controllers/refresh.controller.js';

const router = Router();

router.post('/signup/otp', requestSignupOtp);
router.post('/signup', signup);
router.post('/login', login);
router.post('/password-reset/otp', requestPasswordResetOtp);
router.post('/password-reset', resetPasswordWithOtp);
router.post('/refresh', refreshToken);
router.put('/vault', protect, setupVault);
router.post('/vault/verify', protect, verifyVault);
router.put('/vault/reset', protect, resetPin);
router.put('/password', protect, changePassword);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

export default router;
