import { z } from 'zod';

import {
  dateRangeQuerySchema,
  paginationQuerySchema,
  sortQuerySchema,
  transactionTypeSchema,
} from './common.js';

export const createTransactionSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Amount must be positive'),
  type: transactionTypeSchema,
  categoryId: z.string().uuid('Invalid category'),
  date: z.coerce.date(),
  description: z.string().max(500, 'Description is too long').optional(),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .extend({
    description: z.string().max(500, 'Description is too long').nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const transactionQuerySchema = dateRangeQuerySchema.merge(paginationQuerySchema).extend({
  categoryId: z.string().uuid().optional(),
  type: transactionTypeSchema.optional(),
  sort: sortQuerySchema,
});

export const transactionExportQuerySchema = dateRangeQuerySchema.extend({
  categoryId: z.string().uuid().optional(),
  type: transactionTypeSchema.optional(),
  sort: sortQuerySchema,
});

export const transactionResponseSchema = z.object({
  id: z.string().uuid(),
  amount: z.string(),
  type: transactionTypeSchema,
  description: z.string().nullable(),
  date: z.string().datetime(),
  categoryId: z.string().uuid(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.string(),
    icon: z.string(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
