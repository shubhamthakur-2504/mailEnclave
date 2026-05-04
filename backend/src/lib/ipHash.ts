import crypto from 'crypto';
import { IP_HASH_SECRET } from '../constants/index.js';

export const hashIp = (ip?: string | null): string | null => {
  if (!ip) return null;
  if (!IP_HASH_SECRET) {
    // If secret not configured, fall back to returning raw ip (not recommended)
    return ip;
  }
  return crypto.createHmac('sha256', IP_HASH_SECRET).update(ip).digest('hex');
};
