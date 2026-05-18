import { Request, Response, NextFunction } from 'express';
import { sanitizeError } from '../lib/sanitizeError.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Unhandled error:', sanitizeError(err));
  const status = err?.status || 500;
  const sentryId = (res as any).sentry;

  res.status(status).json({
    success: false,
    message: err?.message || 'Internal Server Error trapped by MailEnclave Security Layout.',
    ...(sentryId && { errorId: sentryId })
  });
}