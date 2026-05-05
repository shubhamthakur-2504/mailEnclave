import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/index.js';
import {
  findRefreshTokenById,
  createRefreshToken,
  markTokenReplaced,
  revokeAllRefreshTokensForUser,
} from '../repositories/refresh.repository.js';
import { hashIp } from '../lib/ipHash.js';
import { refreshTokenSchema } from '../validators/refresh.validator.js';
import { formatZodErrors } from '../validators/formatErrors.js';

const SALT_ROUNDS = 10;

// Refresh token rotation endpoint
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prefer reading refresh token from httpOnly cookie. Fall back to request
    // body for backward compatibility.
    const cookieToken = (req as any).cookies?.refreshToken;
    let token: string | undefined = cookieToken;

    if (!token) {
      const validation = refreshTokenSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: formatZodErrors(validation.error) });
      }

      token = validation.data.refreshToken;
    }
    const parts = token.split('.');
    if (parts.length !== 2) return res.status(400).json({ error: 'Invalid refresh token format' });

    const [id, secret] = parts;
    const tokenRow = await findRefreshTokenById(id);
    if (!tokenRow) return res.status(401).json({ error: 'Invalid refresh token' });

    if (tokenRow.revoked || tokenRow.replacedBy) {
      // token reuse — revoke all and require re-login
      await revokeAllRefreshTokensForUser(tokenRow.userId);
      return res.status(401).json({ error: 'Refresh token reuse detected' });
    }

    if (new Date() > tokenRow.expiresAt) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    const ok = await bcrypt.compare(secret, tokenRow.tokenHash);
    if (!ok) {
      await revokeAllRefreshTokensForUser(tokenRow.userId);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Rotation: create new refresh token and mark old as replaced in a transaction
    const now = new Date();
    const ageMs = now.getTime() - tokenRow.issuedAt.getTime();
    const twentyDaysMs = 20 * 24 * 60 * 60 * 1000;

    const newSecret = crypto.randomBytes(48).toString('base64url');
    const newId = crypto.randomUUID();
    const newHash = await bcrypt.hash(newSecret, SALT_ROUNDS);

    // determine new expiry: extend to full 30 days only if older than 20 days
    const newExpires = ageMs > twentyDaysMs ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : tokenRow.expiresAt;

    // perform create + update atomically
    const ip = req.ip || (req.headers['x-forwarded-for'] as string | undefined) || null;
    const userAgent = (req.get('user-agent') as string) || null;
    const ipHash = hashIp(ip);

    try {
      await createRefreshToken({ id: newId, userId: tokenRow.userId, tokenHash: newHash, issuedAt: now, expiresAt: newExpires, createdByIp: ipHash, userAgent });
      await markTokenReplaced(tokenRow.id, newId);
    } catch (err) {
      // if marking/replacing fails, revoke all and error
      await revokeAllRefreshTokensForUser(tokenRow.userId);
      return res.status(500).json({ error: 'Failed to rotate refresh token' });
    }

    // issue new access token
    const accessToken = jwt.sign({ email: tokenRow.user.email }, JWT_SECRET, { subject: tokenRow.userId, expiresIn: '7d' });

    // set new refresh token as httpOnly cookie and return access token + user
    const newRefresh = `${newId}.${newSecret}`;
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, user: { id: tokenRow.userId, email: tokenRow.user.email } });
  } catch (error) {
    next(error);
  }
};
