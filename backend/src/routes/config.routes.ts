import { Router } from 'express';
import { addTestmailConfig, listConfigs, getConfig, getConfigEmails, deleteConfig, getDashboardStats, subscribeSse, getPrivateTags, addPrivateTag, removePrivateTag } from '../controllers/config.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { protectSse } from '../middlewares/sseAuth.middleware.js';

const router = Router();

// Specific routes first to avoid param conflicts
router.get('/dashboard/stats', protect, getDashboardStats);

// General routes
router.post('/testmail', protect, addTestmailConfig);
router.get('/', protect, listConfigs);
router.get('/:id/private-tags', protect, getPrivateTags);
router.post('/:id/private-tags', protect, addPrivateTag);
router.delete('/:id/private-tags/:tag', protect, removePrivateTag);
router.get('/:id/emails', protect, getConfigEmails);
router.get('/:id/subscribe', protectSse, subscribeSse);
router.get('/:id', protect, getConfig);
router.delete('/:id', protect, deleteConfig);

export default router;
