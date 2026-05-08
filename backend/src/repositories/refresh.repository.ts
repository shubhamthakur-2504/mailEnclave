import prisma from '../db/prisma.js';

const p: any = prisma as any;

export const createRefreshToken = async (data: {
  id: string;
  userId: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  createdByIp?: string | null;
  userAgent?: string | null;
}) => {
  return p.refreshToken.create({
    data: {
      id: data.id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      createdByIp: data.createdByIp,
      userAgent: data.userAgent,
    },
  });
};

export const findRefreshTokenById = (id: string) => {
  return p.refreshToken.findUnique({ where: { id }, include: { user: true } });
};

export const markTokenReplaced = (oldId: string, newId: string) => {
  return p.refreshToken.update({ where: { id: oldId }, data: { revoked: true, replacedBy: newId } });
};

export const revokeAllRefreshTokensForUser = (userId: string) => {
  return p.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
};

export const deleteExpiredRefreshTokens = (before: Date) => {
  return p.refreshToken.deleteMany({ where: { expiresAt: { lt: before } } });
};
