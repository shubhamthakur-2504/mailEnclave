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

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetupVaultInput = z.infer<typeof setupVaultSchema>;
