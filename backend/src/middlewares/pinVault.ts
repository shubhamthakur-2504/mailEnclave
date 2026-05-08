import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';

export const requireVaultPin = (fieldSource: 'body' | 'header' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const pin = fieldSource === 'body' ? (req.body.pin as string) : (req.headers['x-vault-pin'] as string);
      if (!pin) return res.status(400).json({ error: 'Missing vault PIN' });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.vaultPinHash) return res.status(403).json({ error: 'No vault PIN set' });
      const ok = await bcrypt.compare(pin, user.vaultPinHash);
      if (!ok) return res.status(403).json({ error: 'Invalid PIN' });
      next();
    } catch (err) {
      next(err);
    }
  };
};
