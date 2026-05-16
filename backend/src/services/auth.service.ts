import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET } from '../constants/index.js';
import { createUser, findUserByEmail, findUserById, updateUserVaultPinHash, updateUserPasswordHash } from '../repositories/user.repository.js';
import { hashIp } from '../lib/ipHash.js';
import { createRefreshToken, findRefreshTokenById, markTokenReplaced, revokeAllRefreshTokensForUser } from '../repositories/refresh.repository.js';
import { sendOtpEmail, sendRegistrationEmail, sendVaultPinChangeEmail, sendPasswordChangeEmail, sendPasswordResetOtpEmail } from './email.service.js';

const SALT_ROUNDS = 10;
const MAX_OTP_ATTEMPTS = 5;

const otpCache = new Map<string, { otp: string; expiresAt: number; attempts: number }>();
const resetOtpCache = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

export const generateSignupOtp = async (email: string) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return {
      status: 409,
      body: { error: 'Email already registered' },
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  otpCache.set(email, { otp, expiresAt, attempts: 0 });

  // Automatically clear the OTP from memory after 10 minutes
  setTimeout(() => {
    const cached = otpCache.get(email);
    if (cached && cached.expiresAt === expiresAt) {
      otpCache.delete(email);
    }
  }, 10 * 60 * 1000);

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    return {
      status: 500,
      body: { error: 'Failed to send OTP email' },
    };
  }

  return {
    status: 200,
    body: { message: 'OTP sent successfully' },
  };
};

export const generatePasswordResetOtp = async (email: string) => {
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    // Return a generic success message even if the user doesn't exist to prevent email enumeration
    return {
      status: 200,
      body: { message: 'If that email address is in our database, we will send you an email to reset your password.' },
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  resetOtpCache.set(email, { otp, expiresAt, attempts: 0 });

  // Automatically clear the OTP from memory after 10 minutes
  setTimeout(() => {
    const cached = resetOtpCache.get(email);
    if (cached && cached.expiresAt === expiresAt) {
      resetOtpCache.delete(email);
    }
  }, 10 * 60 * 1000);

  try {
    await sendPasswordResetOtpEmail(email, otp);
  } catch (err) {
    return {
      status: 500,
      body: { error: 'Failed to send OTP email' },
    };
  }

  return {
    status: 200,
    body: { message: 'If that email address is in our database, we will send you an email to reset your password.' },
  };
};

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
  input: { email: string; password: string; otp: string },
  meta?: { ip?: string | null; userAgent?: string | null }
) => {
  const cached = otpCache.get(input.email);
  if (!cached || cached.expiresAt < Date.now()) {
    return {
      status: 400,
      body: { error: 'OTP expired or not requested' },
    };
  }

  if (cached.otp !== input.otp) {
    cached.attempts += 1;
    if (cached.attempts >= MAX_OTP_ATTEMPTS) {
      otpCache.delete(input.email);
      return {
        status: 400,
        body: { error: 'Too many failed attempts. Please request a new OTP.' },
      };
    }
    return {
      status: 400,
      body: { error: `Invalid OTP. You have ${MAX_OTP_ATTEMPTS - cached.attempts} attempts left.` },
    };
  }

  otpCache.delete(input.email);
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

  // Send the welcome email (non-blocking)
  sendRegistrationEmail(user.email, user.email).catch(err => {
    console.error('Failed to send welcome email:', err);
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
        hasVaultPin: !!user.vaultPinHash,
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
        hasVaultPin: !!user.vaultPinHash,
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

export const verifyVaultPin = async (input: { userId: string; pin: string }) => {
  const user = await findUserById(input.userId);
  if (!user || !user.vaultPinHash) {
    return { status: 403, body: { error: 'No vault PIN set' } };
  }

  const ok = await bcrypt.compare(input.pin, user.vaultPinHash);
  if (!ok) {
    return { status: 403, body: { error: 'Invalid PIN' } };
  }

  return { status: 200, body: { message: 'Vault unlocked' } };
};

export const changeUserPassword = async (input: { userId: string; oldPassword: string; newPassword: string }) => {
  const user = await findUserById(input.userId);
  if (!user) {
    return { status: 404, body: { error: 'User not found' } };
  }

  const isValid = await bcrypt.compare(input.oldPassword, user.passwordHash);
  if (!isValid) {
    return { status: 401, body: { error: 'Incorrect current password' } };
  }

  const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await updateUserPasswordHash(user.id, newHash);

  // Send the notification email (non-blocking)
  sendPasswordChangeEmail(user.email).catch(err => {
    console.error('Failed to send password change email:', err);
  });

  return { status: 200, body: { message: 'Password changed successfully' } };
};

export const resetPasswordWithOtp = async (input: { email: string; otp: string; newPassword: string }) => {
  const cached = resetOtpCache.get(input.email);

  if (!cached || cached.expiresAt < Date.now()) {
    return {
      status: 400,
      body: { error: 'OTP expired or not requested' },
    };
  }

  if (cached.otp !== input.otp) {
    cached.attempts += 1;
    if (cached.attempts >= MAX_OTP_ATTEMPTS) {
      resetOtpCache.delete(input.email);
      return {
        status: 400,
        body: { error: 'Too many failed attempts. Please request a new OTP.' },
      };
    }
    return {
      status: 400,
      body: { error: `Invalid OTP. You have ${MAX_OTP_ATTEMPTS - cached.attempts} attempts left.` },
    };
  }

  const user = await findUserByEmail(input.email);
  if (!user) {
    return { status: 404, body: { error: 'User not found' } };
  }

  resetOtpCache.delete(input.email);

  const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await updateUserPasswordHash(user.id, newHash);

  // Send the notification email (non-blocking)
  sendPasswordChangeEmail(user.email).catch(err => {
    console.error('Failed to send password change email:', err);
  });

  return { status: 200, body: { message: 'Password reset successfully' } };
};

export const resetVaultPin = async (input: { userId: string; password: string; newPin: string }) => {
  const user = await findUserById(input.userId);
  if (!user) {
    return { status: 404, body: { error: 'User not found' } };
  }

  // Require account password to authorize the PIN reset
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    return { status: 401, body: { error: 'Incorrect account password. Cannot reset vault PIN.' } };
  }

  const vaultPinHash = await bcrypt.hash(input.newPin, SALT_ROUNDS);
  await updateUserVaultPinHash(input.userId, vaultPinHash);

  // Send the notification email (non-blocking)
  sendVaultPinChangeEmail(user.email).catch(err => {
    console.error('Failed to send vault PIN change email:', err);
  });

  return { status: 200, body: { message: 'Vault PIN reset successfully' } };
};
