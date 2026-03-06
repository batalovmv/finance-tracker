import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { TokenExpiredError } = jwt;

import { AUTH } from '@shared/constants.js';
import { AppError, ErrorCode } from '@shared/errors.js';
import { type RegisterInput, type LoginInput, type UserResponse } from '@shared/types/index.js';

import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { seedCategoriesForUser } from '../lib/seed-categories.js';

function formatUser(user: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw AppError.conflict(ErrorCode.AUTH_EMAIL_EXISTS, 'Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, AUTH.BCRYPT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
    });

    await seedCategoriesForUser(created.id, tx);

    return created;
  });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw AppError.badRequest(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw AppError.badRequest(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshTokenValue: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(refreshTokenValue);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AppError(ErrorCode.AUTH_TOKEN_EXPIRED, 'Refresh token has expired', 401);
    }
    throw new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'User not found', 401);
  }

  const accessToken = signAccessToken({ userId: user.id });

  return { accessToken };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw AppError.unauthorized('User not found');
  }

  return formatUser(user);
}
