import prisma from '../db/prisma.js';

export type StoredEmailInput = {
  userId: string;
  configId: string;
  testmailId: string;
  tag: string;
  subject: string;
  from?: string | null;
  htmlBody?: string | null;
  textBody?: string | null;
  isPrivate?: boolean;
  receivedAt: Date;
};

export const upsertEmail = async (input: StoredEmailInput) => {
  return prisma.email.upsert({
    where: {
      userId_testmailId: {
        userId: input.userId,
        testmailId: input.testmailId,
      },
    },
    create: {
      userId: input.userId,
      configId: input.configId,
      testmailId: input.testmailId,
      tag: input.tag,
      subject: input.subject,
      from: input.from ?? null,
      htmlBody: input.htmlBody ?? null,
      textBody: input.textBody ?? null,
      isPrivate: input.isPrivate ?? false,
      receivedAt: input.receivedAt,
    },
    update: {
      configId: input.configId,
      tag: input.tag,
      subject: input.subject,
      from: input.from ?? null,
      htmlBody: input.htmlBody ?? null,
      textBody: input.textBody ?? null,
      isPrivate: input.isPrivate ?? false,
      receivedAt: input.receivedAt,
    },
  });
};

export const listEmailsByConfigId = (configId: string) => {
  return prisma.email.findMany({
    where: { configId },
    orderBy: { receivedAt: 'desc' },
    select: {
      id: true,
      testmailId: true,
      tag: true,
      subject: true,
      from: true,
      htmlBody: true,
      textBody: true,
      isPrivate: true,
      isRead: true,
      receivedAt: true,
    },
  });
};

export const getEmailById = (id: string) => {
  return prisma.email.findUnique({
    where: { id },
  });
};

export const deleteEmailById = (id: string, userId: string) => {
  return prisma.email.deleteMany({
    where: { id, userId },
  });
};

export const deleteEmailsByTag = (configId: string, tag: string, userId: string) => {
  return prisma.email.deleteMany({
    where: { configId, tag, userId },
  });
};

export const deleteEmailsByConfigId = (configId: string, userId: string) => {
  return prisma.email.deleteMany({
    where: { configId, userId },
  });
};

export const markEmailRead = (id: string, userId: string) => {
  return prisma.email.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};