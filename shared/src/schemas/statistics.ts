import { z } from 'zod';

import { dateRangeQuerySchema, transactionTypeSchema } from './common.js';

export const summaryQuerySchema = dateRangeQuerySchema;

export const summaryResponseSchema = z.object({
  totalIncome: z.string(),
  totalExpense: z.string(),
  balance: z.string(),
});

export const byCategoryQuerySchema = dateRangeQuerySchema.extend({
  type: transactionTypeSchema.optional(),
});

export const byCategoryItemSchema = z.object({
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.string(),
    icon: z.string(),
  }),
  amount: z.string(),
  percentage: z.number(),
});

export const monthlyTrendQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(12),
});

export const monthlyTrendItemSchema = z.object({
  month: z.string(),
  income: z.string(),
  expense: z.string(),
});
