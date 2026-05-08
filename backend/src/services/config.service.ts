import { encrypt } from '../lib/crypto.js';
import { upsertTestmailConfig, getConfigsByUserId, getConfigById, deleteConfig } from '../repositories/config.repository.js';
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
