import { NextFunction, Request, Response } from 'express';
import { loginUser, setupVaultPin, signupUser, issueRefreshTokenForUser } from '../services/auth.service.js';
import { revokeAllRefreshTokensForUser, findRefreshTokenById } from '../repositories/refresh.repository.js';
import { findUserById } from '../repositories/user.repository.js';
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
    // On success, issue server-side refresh cookie and return session body
    if (result && result.status >= 200 && result.status < 300 && result.body && (result.body as any).user && (result.body as any).user.id) {
      const userId = (result.body as any).user.id as string;
      const issued = await issueRefreshTokenForUser(userId, { ip, userAgent });
      res.cookie('refreshToken', issued, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

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

    if (result && result.status >= 200 && result.status < 300 && result.body && (result.body as any).user && (result.body as any).user.id) {
      const userId = (result.body as any).user.id as string;
      const issued = await issueRefreshTokenForUser(userId, { ip, userAgent });
      res.cookie('refreshToken', issued, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

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

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = (req as any).cookies?.refreshToken as string | undefined;

    if (cookieToken) {
      const parts = cookieToken.split('.');
      if (parts.length === 2) {
        const [id] = parts;
        const tokenRow = await findRefreshTokenById(id);

        if (tokenRow) {
          await revokeAllRefreshTokensForUser(tokenRow.userId);
        }
      }
    } else if (req.userId) {
      await revokeAllRefreshTokensForUser(req.userId);
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    return res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};
