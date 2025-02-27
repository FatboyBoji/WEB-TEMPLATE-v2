import { User as PrismaUser } from '@prisma/client';

export type User = PrismaUser;

export type SafeUser = Omit<User, 'passwordHash'>;

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}