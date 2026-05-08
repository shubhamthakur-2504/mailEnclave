import crypto from 'crypto';
import { decrypt } from '../lib/crypto.js';
import { getConfigsForSync, markConfigSynced, touchConfigAccess } from '../repositories/config.repository.js';
import { upsertEmail } from '../repositories/email.repository.js';
import { fetchTestmailInbox, type TestmailJsonEmail } from './testmail.service.js';
import { TESTMAIL_ACTIVE_NAMESPACE_WINDOW_MS, TESTMAIL_POLL_INTERVAL_MS, TESTMAIL_ACTIVE_RETRY_DELAY_MS } from '../constants/index.js';

type SyncConfig = {
  id: string;
  userId: string;
  namespace: string;
  encryptedApiKey: string;
  lastSyncedAt: Date | null;
  lastAccessedAt: Date | null;
  createdAt: Date;
};

const ACTIVE_NAMESPACE_WINDOW_MS = TESTMAIL_ACTIVE_NAMESPACE_WINDOW_MS;
const POLL_INTERVAL_MS = TESTMAIL_POLL_INTERVAL_MS;
const ACTIVE_RETRY_DELAY_MS = TESTMAIL_ACTIVE_RETRY_DELAY_MS;

let workerStarted = false;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeTestmailId = (config: SyncConfig, email: TestmailJsonEmail) => {
  if (typeof email.id === 'string' && email.id.trim()) {
    return email.id;
  }

  if (typeof email.message_id === 'string' && email.message_id.trim()) {
    return email.message_id;
  }

  const hash = crypto.createHash('sha256');
  hash.update(config.id);
  hash.update('\u0000');
  hash.update(config.namespace);
  hash.update('\u0000');
  hash.update(email.tag ?? '');
  hash.update('\u0000');
  hash.update(email.subject ?? '');
  hash.update('\u0000');
  hash.update(email.from ?? '');
  hash.update('\u0000');
  hash.update(email.timestamp ? String(email.timestamp) : '');
  hash.update('\u0000');
  hash.update(email.html ?? '');
  hash.update('\u0000');
  hash.update(email.text ?? '');
  return hash.digest('hex');
};

const emailTimestamp = (email: TestmailJsonEmail) => {
  if (typeof email.timestamp === 'number' && Number.isFinite(email.timestamp)) {
    return new Date(email.timestamp);
  }
  return new Date();
};

const getSyncStartTimestamp = (config: SyncConfig) => {
  return config.lastSyncedAt ? config.lastSyncedAt.getTime() + 1 : config.createdAt.getTime();
};

const pickActiveConfig = (configs: SyncConfig[]) => {
  const now = Date.now();
  return configs.find((config) => {
    if (!config.lastAccessedAt) {
      return false;
    }
    return now - config.lastAccessedAt.getTime() <= ACTIVE_NAMESPACE_WINDOW_MS;
  }) ?? null;
};

const syncConfig = async (config: SyncConfig, livequery: boolean) => {
  const apiKey = decrypt(config.encryptedApiKey);
  const { status, data } = await fetchTestmailInbox({
    apiKey,
    namespace: config.namespace,
    query: {
      timestamp_from: getSyncStartTimestamp(config),
      limit: 100,
      livequery,
    },
  });

  if (status === 307) {
    return { status, saved: 0, latestTimestamp: config.lastSyncedAt ?? config.createdAt };
  }

  const emails = Array.isArray(data?.emails) ? data.emails : [];
  let latestTimestamp: Date = config.lastSyncedAt ?? config.createdAt;

  for (const email of emails) {
    const receivedAt = emailTimestamp(email);
    if (receivedAt > latestTimestamp) {
      latestTimestamp = receivedAt;
    }

    await upsertEmail({
      userId: config.userId,
      configId: config.id,
      testmailId: normalizeTestmailId(config, email),
      tag: email.tag ?? 'untagged',
      subject: email.subject ?? '(no subject)',
      htmlBody: typeof email.html === 'string' ? email.html : null,
      receivedAt,
      isPrivate: false,
    });
  }

  await markConfigSynced(config.id, config.userId, latestTimestamp);

  return {
    status,
    saved: emails.length,
    latestTimestamp,
  };
};

const runPriorityLoop = async () => {
  let backoffMs = ACTIVE_RETRY_DELAY_MS;

  while (true) {
    try {
      const configs = await getConfigsForSync();
      const activeConfig = pickActiveConfig(configs);

      if (!activeConfig) {
        await sleep(backoffMs);
        continue;
      }

      backoffMs = ACTIVE_RETRY_DELAY_MS;
      await syncConfig(activeConfig, true);
    } catch (error) {
      console.error('[testmail-sync] priority loop error', error);
      backoffMs = Math.min(backoffMs * 2, 30000);
      await sleep(backoffMs);
    }
  }
};

const runPollLoop = async () => {
  while (true) {
    try {
      await sleep(POLL_INTERVAL_MS);
      const configs = await getConfigsForSync();
      const activeConfig = pickActiveConfig(configs);

      for (const config of configs) {
        if (activeConfig && activeConfig.id === config.id) {
          continue;
        }

        await syncConfig(config, false);
      }
    } catch (error) {
      console.error('[testmail-sync] poll loop error', error);
    }
  }
};

export const startTestmailSyncWorker = async () => {
  if (workerStarted) {
    return;
  }

  workerStarted = true;
  void runPriorityLoop();
  void runPollLoop();
};

export const touchTestmailNamespace = async (configId: string, userId: string) => {
  await touchConfigAccess(configId, userId);
};