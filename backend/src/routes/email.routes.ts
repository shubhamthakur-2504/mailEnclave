import { Router } from 'express';
import { getEmail, markRead } from '../controllers/email.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:id', protect, getEmail);
router.patch('/:id/read', protect, markRead);

export default router;
