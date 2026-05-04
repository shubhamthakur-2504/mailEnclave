import { ZodError } from 'zod';

export const formatZodErrors = (error: ZodError): string => {
  const messages = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });
  return messages.join('; ');
};
