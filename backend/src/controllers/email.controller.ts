import { NextFunction, Request, Response } from 'express';
import { getEmailById, markEmailRead, deleteEmailById, deleteEmailsByTag } from '../repositories/email.repository.js';
import { getConfigById } from '../repositories/config.repository.js';

export const getEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const email = await getEmailById(id);
    if (!email || email.userId !== userId) return res.status(404).json({ error: 'Email not found' });

    return res.json({
      email: {
        id: email.id,
        testmailId: email.testmailId,
        tag: email.tag,
        subject: email.subject,
        from: email.from,
        htmlBody: email.htmlBody,
        text: email.textBody,
        isRead: email.isRead,
        isPrivate: email.isPrivate,
        receivedAt: email.receivedAt,
        configId: email.configId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await markEmailRead(id, userId);
    if (result.count === 0) return res.status(404).json({ error: 'Email not found' });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deleteEmailById(id, userId);
    if (result.count === 0) return res.status(404).json({ error: 'Email not found' });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const configId = Array.isArray(req.params.configId) ? req.params.configId[0] : req.params.configId;
    const tag = Array.isArray(req.params.tag) ? req.params.tag[0] : req.params.tag;

    // Verify config ownership
    const config = await getConfigById(configId, userId);
    if (!config) return res.status(404).json({ error: 'Config not found' });

    const result = await deleteEmailsByTag(configId, tag, userId);
    return res.json({ success: true, deleted: result.count });
  } catch (err) {
    next(err);
  }
};

export default { getEmail, markRead, deleteEmail, deleteTag };
