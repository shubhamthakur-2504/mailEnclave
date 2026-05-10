import { NextFunction, Request, Response } from 'express';
import { addTestmailConfig as addTestmailConfigService, listConfigs as listConfigsService, getConfig as getConfigService, removeConfig as removeConfigService, getDashboardStats as getDashboardStatsService } from '../services/config.service.js';
import { addTestmailConfigSchema } from '../validators/config.validator.js';
import { formatZodErrors } from '../validators/formatErrors.js';
import { listEmailsByConfigId } from '../repositories/email.repository.js';
import { touchTestmailNamespace } from '../services/testmail-sync.service.js';
import { subscribeToNamespace } from '../services/sse.service.js';

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

export const getConfigEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const configResult = await getConfigService(id, userId);
    if (configResult.status !== 200) {
      return res.status(configResult.status).json(configResult.body);
    }

    await touchTestmailNamespace(id, userId);
    const emails = await listEmailsByConfigId(id);

    return res.status(200).json({
      config: configResult.body.config,
      result: 'success',
      message: null,
      count: emails.length,
      limit: emails.length,
      offset: 0,
      emails: emails.map((email) => ({
        id: email.id,
        testmailId: email.testmailId,
        tag: email.tag,
        subject: email.subject,
        timestamp: email.receivedAt.getTime(),
        receivedAt: email.receivedAt,
        html: email.htmlBody,
        isPrivate: email.isPrivate,
      })),
    });
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

export const subscribeSse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const configResult = await getConfigService(id, userId);
    if (configResult.status !== 200) {
      return res.status(configResult.status).json(configResult.body);
    }

    subscribeToNamespace(id, res);
  } catch (error) {
    next(error);
  }
};
