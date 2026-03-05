import { z } from 'zod';

import { transactionTypeSchema } from './common.js';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  type: transactionTypeSchema,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format')
    .optional(),
  icon: z.string().max(50).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long').optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format')
      .optional(),
    icon: z.string().max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const categoryQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
});

export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: transactionTypeSchema,
  color: z.string(),
  icon: z.string(),
  createdAt: z.string().datetime(),
});
