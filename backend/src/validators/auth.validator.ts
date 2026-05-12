import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const setupVaultSchema = z.object({
  pin: z.string().min(4, 'PIN must be at least 4 characters'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const resetVaultPinSchema = z.object({
  password: z.string().min(1, 'Account password is required to reset your vault PIN'),
  newPin: z.string().min(4, 'PIN must be at least 4 characters'),
  confirmPin: z.string().min(4, 'PIN must be at least 4 characters'),
}).refine((d) => d.newPin === d.confirmPin, { message: 'PINs do not match', path: ['confirmPin'] });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetupVaultInput = z.infer<typeof setupVaultSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetVaultPinInput = z.infer<typeof resetVaultPinSchema>;
