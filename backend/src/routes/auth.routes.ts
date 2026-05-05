import { Router } from 'express';
import { login, setupVault, signup, me, logout } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { refreshToken } from '../controllers/refresh.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.put('/vault', protect, setupVault);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

export default router;
