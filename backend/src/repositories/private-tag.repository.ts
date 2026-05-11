import prisma from '../db/prisma.js';

export const listPrivateTagsByConfigId = async (configId: string, userId: string) => {
  const tags = await prisma.privateTag.findMany({
    where: {
      configId,
      config: {
        userId,
      },
    },
    select: {
      tag: true,
    },
    orderBy: {
      tag: 'asc',
    },
  });

  return tags;
};

export const addPrivateTagForConfig = async (configId: string, userId: string, tag: string) => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.userConfig.findFirst({
      where: {
        id: configId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!config) {
      return null;
    }

    const privateTag = await tx.privateTag.upsert({
      where: {
        configId_tag: {
          configId,
          tag,
        },
      },
      create: {
        configId,
        userId,
        tag,
      },
      update: {
        userId,
      },
      select: {
        id: true,
        tag: true,
        configId: true,
      },
    });

    const backfill = await tx.email.updateMany({
      where: {
        configId,
        tag,
      },
      data: {
        isPrivate: true,
      },
    });

    return {
      privateTag,
      backfillCount: backfill.count,
    };
  });
};

export const removePrivateTagForConfig = async (configId: string, userId: string, tag: string) => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.userConfig.findFirst({
      where: {
        id: configId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!config) {
      return null;
    }

    const deleted = await tx.privateTag.deleteMany({
      where: {
        configId,
        tag,
      },
    });

    const backfill = await tx.email.updateMany({
      where: {
        configId,
        tag,
      },
      data: {
        isPrivate: false,
      },
    });

    return {
      deletedCount: deleted.count,
      backfillCount: backfill.count,
    };
  });
};