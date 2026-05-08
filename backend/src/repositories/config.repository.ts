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
      createdAt: true,
    },
  });
};

export const getConfigsByUserId = (userId: string) => {
  return prisma.userConfig.findMany({
    where: { userId },
    select: {
      id: true,
      namespace: true,
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
      createdAt: true,
      userId: true,
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
