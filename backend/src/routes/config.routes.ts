import { Router } from 'express';
import { addTestmailConfig, listConfigs, getConfig, getConfigEmails, deleteConfig, getDashboardStats, subscribeSse } from '../controllers/config.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { protectSse } from '../middlewares/sseAuth.middleware.js';

const router = Router();

// Specific routes first to avoid param conflicts
router.get('/dashboard/stats', protect, getDashboardStats);

// General routes
router.post('/testmail', protect, addTestmailConfig);
router.get('/', protect, listConfigs);
router.get('/:id/emails', protect, getConfigEmails);
router.get('/:id/subscribe', protectSse, subscribeSse);
router.get('/:id', protect, getConfig);
router.delete('/:id', protect, deleteConfig);

export default router;
