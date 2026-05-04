import prisma from '../db/prisma.js';

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

export const createUser = (data: { email: string; passwordHash: string }) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
};

export const updateUserVaultPinHash = (userId: string, vaultPinHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { vaultPinHash },
    select: {
      id: true,
      email: true,
      vaultPinHash: true,
      createdAt: true,
    },
  });
};
