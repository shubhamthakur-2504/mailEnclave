import { NextFunction, Request, Response } from 'express';
import { addTestmailConfig as addTestmailConfigService } from '../services/config.service.js';
import { addTestmailConfigSchema } from '../validators/config.validator.js';
import { formatZodErrors } from '../validators/formatErrors.js';

export const addTestmailConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = addTestmailConfigSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const { namespace, apiKey } = validation.data;
    const result = await addTestmailConfigService({ userId, namespace, apiKey });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
