import { encrypt } from '../lib/crypto.js';
import { upsertTestmailConfig, getConfigsByUserId, getConfigById, deleteConfig } from '../repositories/config.repository.js';
import { addPrivateTagForConfig, listPrivateTagsByConfigId, removePrivateTagForConfig } from '../repositories/private-tag.repository.js';
import prisma from '../db/prisma.js';

export const addTestmailConfig = async (input: {
  userId: string;
  namespace: string;
  apiKey: string;
}) => {
  const encryptedApiKey = encrypt(input.apiKey);
  const config = await upsertTestmailConfig({
    userId: input.userId,
    namespace: input.namespace,
    encryptedApiKey,
  });

  return {
    status: 201,
    body: {
      message: 'Testmail config saved successfully',
      config,
    },
  };
};

export const updateTestmailConfig = async (configId: string, userId: string, input: { namespace?: string; apiKey?: string }) => {
  const config = await getConfigById(configId, userId);
  if (!config) {
    return {
      status: 404,
      body: { error: 'Config not found' },
    };
  }

  const dataToUpdate: any = {};
  if (input.namespace) dataToUpdate.namespace = input.namespace;
  if (input.apiKey) dataToUpdate.encryptedApiKey = encrypt(input.apiKey);

  const updatedConfig = await prisma.userConfig.update({
    where: { id: configId },
    data: dataToUpdate,
    select: {
      id: true,
      namespace: true,
      lastSyncedAt: true,
      lastAccessedAt: true,
      createdAt: true,
    },
  });

  return {
    status: 200,
    body: {
      message: 'Config updated successfully',
      config: updatedConfig,
    },
  };
};

export const listConfigs = async (userId: string) => {
  const configs = await getConfigsByUserId(userId);
  return {
    status: 200,
    body: {
      configs,
    },
  };
};

export const getConfig = async (configId: string, userId: string) => {
  const config = await getConfigById(configId, userId);
  if (!config) {
    return {
      status: 404,
      body: {
        error: 'Config not found',
      },
    };
  }
  return {
    status: 200,
    body: {
      config,
    },
  };
};

export const removeConfig = async (configId: string, userId: string) => {
  const config = await deleteConfig(configId, userId);
  if (!config) {
    return {
      status: 404,
      body: {
        error: 'Config not found',
      },
    };
  }
  return {
    status: 200,
    body: {
      message: 'Config deleted successfully',
      config,
    },
  };
};

export const getDashboardStats = async (userId: string) => {
  const [configCount, emailCount, user] = await Promise.all([
    prisma.userConfig.count({
      where: { userId },
    }),
    prisma.email.count({
      where: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    status: 200,
    body: {
      stats: {
        linkedConfigs: configCount,
        totalEmails: emailCount,
        memberSince: user?.createdAt,
        email: user?.email,
      },
    },
  };
};

export const listPrivateTags = async (configId: string, userId: string) => {
  const config = await getConfigById(configId, userId);
  if (!config) {
    return {
      status: 404,
      body: {
        error: 'Config not found',
      },
    };
  }

  const tags = await listPrivateTagsByConfigId(configId, userId);
  return {
    status: 200,
    body: {
      config,
      privateTags: tags,
    },
  };
};

export const markTagPrivate = async (configId: string, userId: string, tag: string) => {
  const result = await addPrivateTagForConfig(configId, userId, tag);
  if (!result) {
    return {
      status: 404,
      body: {
        error: 'Config not found',
      },
    };
  }

  return {
    status: 200,
    body: {
      message: 'Tag marked private',
      privateTag: result.privateTag,
      backfilled: result.backfillCount,
    },
  };
};

export const unmarkTagPrivate = async (configId: string, userId: string, tag: string) => {
  const result = await removePrivateTagForConfig(configId, userId, tag);
  if (!result) {
    return {
      status: 404,
      body: {
        error: 'Config not found',
      },
    };
  }

  return {
    status: 200,
    body: {
      message: 'Tag unmarked private',
      deleted: result.deletedCount,
      backfilled: result.backfillCount,
    },
  };
};
