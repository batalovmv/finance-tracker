import { z } from 'zod';

import { PAGINATION_DEFAULTS, TRANSACTION_TYPES } from '../constants.js';

// --- Transaction Type (shared across schemas) ---

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES);

// --- Pagination ---

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
});

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// --- API Response ---

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const apiPaginatedSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    meta: paginationMetaSchema,
  });

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// --- Sort ---

export const sortQuerySchema = z
  .string()
  .regex(/^(date|amount|createdAt):(asc|desc)$/, 'Invalid sort parameter')
  .optional();

// --- Date Range Filter ---

export const dateRangeQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
