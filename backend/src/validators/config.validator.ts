import { z } from 'zod';

export const addTestmailConfigSchema = z.object({
  namespace: z.string().min(1, 'Namespace is required').max(255, 'Namespace too long'),
  apiKey: z.string().min(1, 'API key is required'),
});

export type AddTestmailConfigInput = z.infer<typeof addTestmailConfigSchema>;
