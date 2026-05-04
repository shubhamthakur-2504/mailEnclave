import { Router } from 'express';
import { addTestmailConfig } from '../controllers/config.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/testmail', protect, addTestmailConfig);

export default router;
