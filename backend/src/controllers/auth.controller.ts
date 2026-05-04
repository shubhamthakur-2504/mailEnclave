import { NextFunction, Request, Response } from 'express';
import { loginUser, setupVaultPin, signupUser } from '../services/auth.service.js';
import { signupSchema, loginSchema, setupVaultSchema } from '../validators/auth.validator.js';
import { formatZodErrors } from '../validators/formatErrors.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const { email, password } = validation.data;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string | undefined) || null;
    const userAgent = (req.get('user-agent') as string) || null;
    const result = await signupUser({ email, password }, { ip, userAgent });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const { email, password } = validation.data;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string | undefined) || null;
    const userAgent = (req.get('user-agent') as string) || null;
    const result = await loginUser({ email, password }, { ip, userAgent });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const setupVault = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = setupVaultSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const { pin } = validation.data;
    const result = await setupVaultPin({ userId, pin });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
