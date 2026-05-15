import { Request, Response, NextFunction } from 'express';
import { sanitizeError } from '../lib/sanitizeError.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', sanitizeError(err));
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
}
