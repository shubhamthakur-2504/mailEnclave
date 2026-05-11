import prisma from '../db/prisma.js';

export const upsertTestmailConfig = (data: {
  userId: string;
  namespace: string;
  encryptedApiKey: string;
}) => {
  const { userId, namespace, encryptedApiKey } = data;

  return prisma.userConfig.upsert({
    where: {
      userId_namespace: {
        userId,
        namespace,
      },
    },
    create: {
      userId,
      namespace,
      encryptedApiKey,
    },
    update: {
      encryptedApiKey,
    },
    select: {
      id: true,
      namespace: true,
      lastSyncedAt: true,
      lastAccessedAt: true,
      createdAt: true,
      privateTags: {
        select: {
          tag: true,
        },
      },
    },
  });
};

export const getConfigsByUserId = (userId: string) => {
  return prisma.userConfig.findMany({
    where: { userId },
    select: {
      id: true,
      namespace: true,
      lastSyncedAt: true,
      lastAccessedAt: true,
      createdAt: true,
      _count: {
        select: { emails: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getConfigById = (configId: string, userId: string) => {
  return prisma.userConfig.findUnique({
    where: { id: configId },
    select: {
      id: true,
      namespace: true,
      lastSyncedAt: true,
      lastAccessedAt: true,
      createdAt: true,
      userId: true,
      privateTags: {
        select: {
          tag: true,
        },
      },
      _count: {
        select: { emails: true },
      },
    },
  }).then((config) => {
    // Verify ownership
    if (config && config.userId !== userId) {
      return null;
    }
    return config;
  });
};

export const getConfigByIdWithApiKey = (configId: string, userId: string) => {
  return prisma.userConfig.findUnique({
    where: { id: configId },
    select: {
      id: true,
      namespace: true,
      encryptedApiKey: true,
      lastSyncedAt: true,
      lastAccessedAt: true,
      userId: true,
      createdAt: true,
      privateTags: {
        select: {
          tag: true,
        },
      },
    },
  }).then((config) => {
    if (config && config.userId !== userId) {
      return null;
    }
    return config;
  });
};

export const getConfigsForSync = () => {
  return prisma.userConfig.findMany({
    select: {
      id: true,
      userId: true,
      namespace: true,
      encryptedApiKey: true,
      lastSyncedAt: true,
      lastAccessedAt: true,
      createdAt: true,
      privateTags: {
        select: {
          tag: true,
        },
      },
    },
    orderBy: [
      { lastAccessedAt: 'desc' },
      { lastSyncedAt: 'asc' },
      { createdAt: 'asc' },
    ],
  });
};

export const touchConfigAccess = (configId: string, userId: string) => {
  return prisma.userConfig.updateMany({
    where: {
      id: configId,
      userId,
    },
    data: {
      lastAccessedAt: new Date(),
    },
  });
};

export const markConfigSynced = (configId: string, userId: string, lastSyncedAt: Date) => {
  return prisma.userConfig.updateMany({
    where: {
      id: configId,
      userId,
    },
    data: {
      lastSyncedAt,
    },
  });
};

export const deleteConfig = (configId: string, userId: string) => {
  // First verify ownership
  return prisma.userConfig.findUnique({
    where: { id: configId },
    select: { userId: true },
  }).then((config) => {
    if (!config || config.userId !== userId) {
      return null;
    }
    // Delete the config and cascade delete emails and tags
    return prisma.userConfig.delete({
      where: { id: configId },
      select: {
        id: true,
        namespace: true,
      },
    });
  });
};
