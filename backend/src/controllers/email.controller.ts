import { NextFunction, Request, Response } from 'express';
import { getEmailById, markEmailRead } from '../repositories/email.repository.js';

export const getEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const email = await getEmailById(id);
    if (!email || email.userId !== userId) return res.status(404).json({ error: 'Email not found' });

    return res.json({ email });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await markEmailRead(id, userId);
    if (result.count === 0) return res.status(404).json({ error: 'Email not found' });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export default { getEmail, markRead };
