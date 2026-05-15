import prisma from '../db/prisma.js';
import { encrypt, decrypt } from '../lib/crypto.js';

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

/** Safely decrypt a nullable field — returns null if the value is null/empty or decryption fails */
const safeDecrypt = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    return decrypt(value);
  } catch {
    // If decryption fails (e.g. legacy plaintext row), return as-is so old data still readable
    return value;
  }
};

export const upsertEmail = async (input: StoredEmailInput) => {
  const encryptedHtml = input.htmlBody ? encrypt(input.htmlBody) : null;
  const encryptedText = input.textBody ? encrypt(input.textBody) : null;

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
      htmlBody: encryptedHtml,
      textBody: encryptedText,
      isPrivate: input.isPrivate ?? false,
      receivedAt: input.receivedAt,
    },
    update: {
      configId: input.configId,
      tag: input.tag,
      subject: input.subject,
      from: input.from ?? null,
      htmlBody: encryptedHtml,
      textBody: encryptedText,
      isPrivate: input.isPrivate ?? false,
      receivedAt: input.receivedAt,
    },
  });
};

export const listEmailsByConfigId = async (
  configId: string,
  options: { page?: number; pageSize?: number } = {}
) => {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 30));
  const skip = (page - 1) * pageSize;

  const [emails, total] = await Promise.all([
    prisma.email.findMany({
      where: { configId },
      orderBy: { receivedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        testmailId: true,
        tag: true,
        subject: true,
        from: true,
        isPrivate: true,
        isRead: true,
        receivedAt: true,
        // Never return encrypted body in the list — body only served on single-email fetch
      },
    }),
    prisma.email.count({ where: { configId } }),
  ]);

  return { emails, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};

export const getEmailById = async (id: string) => {
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) return null;

  return {
    ...email,
    htmlBody: safeDecrypt(email.htmlBody),
    textBody: safeDecrypt(email.textBody),
  };
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