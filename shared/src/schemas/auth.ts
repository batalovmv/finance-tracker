import { z } from 'zod';

import { AUTH } from '../constants.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(
      AUTH.MIN_PASSWORD_LENGTH,
      `Password must be at least ${AUTH.MIN_PASSWORD_LENGTH} characters`,
    )
    .max(
      AUTH.MAX_PASSWORD_LENGTH,
      `Password must be at most ${AUTH.MAX_PASSWORD_LENGTH} characters`,
    ),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
});
