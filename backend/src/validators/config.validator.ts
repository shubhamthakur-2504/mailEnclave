import { z } from 'zod';

export const addTestmailConfigSchema = z.object({
  namespace: z.string().min(1, 'Namespace is required').max(255, 'Namespace too long'),
  apiKey: z.string().min(1, 'API key is required'),
});

export const updateTestmailConfigSchema = z.object({
  namespace: z.string().min(1, 'Namespace is required').max(255, 'Namespace too long').optional(),
  apiKey: z.string().min(1, 'API key is required').optional(),
});

const optionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === false) {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return value;
}, z.boolean().optional());

export const testmailEmailsQuerySchema = z.object({
  tag: z.string().min(1).optional(),
  tag_prefix: z.string().min(1).optional(),
  timestamp_from: z.coerce.number().int().nonnegative().optional(),
  timestamp_to: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(0).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  livequery: optionalBoolean,
  headers: optionalBoolean,
  spam_report: optionalBoolean,
});

export const privateTagSchema = z.object({
  tag: z.string().trim().min(1, 'Tag is required').max(255, 'Tag too long'),
});

export const privateTagParamSchema = z.object({
  tag: z.string().trim().min(1, 'Tag is required').max(255, 'Tag too long'),
});

export const deleteConfigSchema = z.object({
  password: z.string().min(1, 'Account password is required to delete a namespace'),
});

export type AddTestmailConfigInput = z.infer<typeof addTestmailConfigSchema>;
export type TestmailEmailsQueryInput = z.infer<typeof testmailEmailsQuerySchema>;
export type PrivateTagInput = z.infer<typeof privateTagSchema>;
export type PrivateTagParamInput = z.infer<typeof privateTagParamSchema>;
export type DeleteConfigInput = z.infer<typeof deleteConfigSchema>;
