import dotenv from 'dotenv';
dotenv.config();

const getEnv = (key: string, required = true): string => {
  const v = process.env[key];
  if (required && !v) throw new Error(`Missing env ${key}`);
  return v as string;
};

export const PORT = Number(process.env.PORT || 4000);
export const DATABASE_URL = getEnv('DATABASE_URL');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const ENCRYPTION_KEY = getEnv('ENCRYPTION_KEY'); // expect 32-byte key in hex (64 hex chars) or base64
export const TESTMAIL_BASE_URL = process.env.TESTMAIL_BASE_URL || 'https://api.testmail.app';
export const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS || 10000);
