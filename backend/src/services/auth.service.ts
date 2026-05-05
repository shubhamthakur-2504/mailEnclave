import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET } from '../constants/index.js';
import { createUser, findUserByEmail, updateUserVaultPinHash } from '../repositories/user.repository.js';
import { hashIp } from '../lib/ipHash.js';
import { createRefreshToken, findRefreshTokenById, markTokenReplaced, revokeAllRefreshTokensForUser } from '../repositories/refresh.repository.js';

const SALT_ROUNDS = 10;

const buildAuthSession = (user: { id: string; email: string }) => {
  const token = jwt.sign({ email: user.email }, JWT_SECRET, {
    subject: user.id,
    expiresIn: '7d',
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
};

export const signupUser = async (
  input: { email: string; password: string },
  meta?: { ip?: string | null; userAgent?: string | null }
) => {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    return {
      status: 409,
      body: { error: 'Email already registered' },
    };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await createUser({
    email: input.email,
    passwordHash,
  });

  // create refresh token and persist, but do not return it in the response
  const refreshSecret = crypto.randomBytes(48).toString('base64url');
  const refreshId = crypto.randomUUID();
  const tokenHash = await bcrypt.hash(refreshSecret, SALT_ROUNDS);
  const now = new Date();
  const refreshExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const ipHash = hashIp(meta?.ip ?? null);

  await createRefreshToken({ id: refreshId, userId: user.id, tokenHash, issuedAt: now, expiresAt: refreshExpires, createdByIp: ipHash, userAgent: meta?.userAgent });

  return {
    status: 201,
    body: {
      accessToken: jwt.sign({ email: user.email }, JWT_SECRET, { subject: user.id, expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
      },
    },
  };
};

export const loginUser = async (
  input: { email: string; password: string },
  meta?: { ip?: string | null; userAgent?: string | null }
) => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    return {
      status: 401,
      body: { error: 'Invalid credentials' },
    };
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    return {
      status: 401,
      body: { error: 'Invalid credentials' },
    };
  }

  // create refresh token and persist, but do not return it in the response
  const refreshSecret = crypto.randomBytes(48).toString('base64url');
  const refreshId = crypto.randomUUID();
  const tokenHash = await bcrypt.hash(refreshSecret, SALT_ROUNDS);
  const now = new Date();
  const refreshExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const ipHash = hashIp(meta?.ip ?? null);

  await createRefreshToken({ id: refreshId, userId: user.id, tokenHash, issuedAt: now, expiresAt: refreshExpires, createdByIp: ipHash, userAgent: meta?.userAgent });

  return {
    status: 200,
    body: {
      accessToken: jwt.sign({ email: user.email }, JWT_SECRET, { subject: user.id, expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
      },
    },
  };
};

// Issue a refresh token for an existing user and return the token string
export const issueRefreshTokenForUser = async (
  userId: string,
  meta?: { ip?: string | null; userAgent?: string | null }
) => {
  const refreshSecret = crypto.randomBytes(48).toString('base64url');
  const refreshId = crypto.randomUUID();
  const tokenHash = await bcrypt.hash(refreshSecret, SALT_ROUNDS);
  const now = new Date();
  const refreshExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ipHash = hashIp(meta?.ip ?? null);

  await createRefreshToken({ id: refreshId, userId, tokenHash, issuedAt: now, expiresAt: refreshExpires, createdByIp: ipHash, userAgent: meta?.userAgent });

  return `${refreshId}.${refreshSecret}`;
};

export const setupVaultPin = async (input: { userId: string; pin: string }) => {
  const vaultPinHash = await bcrypt.hash(input.pin, SALT_ROUNDS);
  const user = await updateUserVaultPinHash(input.userId, vaultPinHash);

  return {
    status: 200,
    body: {
      message: 'Vault PIN updated successfully',
      user,
    },
  };
};
