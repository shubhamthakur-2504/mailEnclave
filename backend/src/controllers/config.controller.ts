import { NextFunction, Request, Response } from 'express';
import { addTestmailConfig as addTestmailConfigService, listConfigs as listConfigsService, getConfig as getConfigService, removeConfig as removeConfigService, getDashboardStats as getDashboardStatsService } from '../services/config.service.js';
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

export const listConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await listConfigsService(userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await getConfigService(id, userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const deleteConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await removeConfigService(id, userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await getDashboardStatsService(userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
