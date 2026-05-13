import { Router } from 'express';
import { getEmail, markRead, deleteEmail, deleteTag } from '../controllers/email.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Specific routes first (must be before /:id wildcard)
router.delete('/tags/:configId/:tag', protect, deleteTag);

router.get('/:id', protect, getEmail);
router.patch('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteEmail);

export default router;
