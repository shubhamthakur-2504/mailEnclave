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
