import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/index.js';

export const protectSse = (req: Request, res: Response, next: NextFunction) => {
  const token = typeof req.query.token === 'string' ? req.query.token : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Missing stream token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const userId = typeof payload.sub === 'string' ? payload.sub : undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
