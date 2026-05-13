import { NextFunction, Request, Response } from 'express';
import { addTestmailConfig as addTestmailConfigService, updateTestmailConfig as updateTestmailConfigService, listConfigs as listConfigsService, getConfig as getConfigService, removeConfig as removeConfigService, getDashboardStats as getDashboardStatsService, listPrivateTags as listPrivateTagsService, markTagPrivate as markTagPrivateService, unmarkTagPrivate as unmarkTagPrivateService } from '../services/config.service.js';
import { addTestmailConfigSchema, updateTestmailConfigSchema, privateTagSchema, privateTagParamSchema, deleteConfigSchema } from '../validators/config.validator.js';
import { formatZodErrors } from '../validators/formatErrors.js';
import { listEmailsByConfigId } from '../repositories/email.repository.js';
import { touchTestmailNamespace } from '../services/testmail-sync.service.js';
import { subscribeToNamespace } from '../services/sse.service.js';
import { findUserById } from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';

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

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validation = updateTestmailConfigSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const result = await updateTestmailConfigService(id, userId, validation.data);
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

    // Require account password for namespace deletion
    const validation = deleteConfigSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    // Verify password
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const passwordOk = await bcrypt.compare(validation.data.password, user.passwordHash);
    if (!passwordOk) return res.status(403).json({ error: 'Incorrect account password' });

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
        from: email.from,
        timestamp: email.receivedAt.getTime(),
        receivedAt: email.receivedAt,
        html: email.htmlBody,
        text: email.textBody,
        isPrivate: email.isPrivate,
        isRead: email.isRead,
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

export const getPrivateTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await listPrivateTagsService(id, userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const addPrivateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = privateTagSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await markTagPrivateService(id, userId, validation.data.tag);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const removePrivateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tagValue = Array.isArray(req.params.tag) ? req.params.tag[0] : req.params.tag;
    const validation = privateTagParamSchema.safeParse({ tag: tagValue });
    if (!validation.success) {
      return res.status(400).json({ error: formatZodErrors(validation.error) });
    }

    const result = await unmarkTagPrivateService(id, userId, validation.data.tag);
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
