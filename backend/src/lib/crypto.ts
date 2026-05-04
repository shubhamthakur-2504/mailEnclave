import crypto from 'crypto';
import { ENCRYPTION_KEY } from '../constants/index.js';

const resolveKey = (keyStr: string): Buffer => {
  // accept hex (64 chars) or base64
  if (/^[0-9a-fA-F]{64}$/.test(keyStr)) return Buffer.from(keyStr, 'hex');
  return Buffer.from(keyStr, 'base64');
};

const key = resolveKey(ENCRYPTION_KEY);
if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (hex 64 chars or base64)');

export const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return iv.toString('base64') + ':' + encrypted.toString('base64');
};

export const decrypt = (payload: string): string => {
  const parts = payload.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = Buffer.from(parts[1], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};
