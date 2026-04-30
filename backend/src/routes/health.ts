import { Router } from 'express';
import { pool } from '../db/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    // quick DB check
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err: any) {
    res.status(503).json({ status: 'unhealthy', error: err?.message || String(err) });
  }
});

export default router;
