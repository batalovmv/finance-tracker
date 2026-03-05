import { type z } from 'zod';

import {
  type authResponseSchema,
  type registerSchema,
  type loginSchema,
  type userResponseSchema,
  type tokenResponseSchema,
} from '../schemas/auth.js';
import {
  type createCategorySchema,
  type updateCategorySchema,
  type categoryResponseSchema,
  type categoryQuerySchema,
} from '../schemas/category.js';
import { type paginationMetaSchema, type apiErrorSchema } from '../schemas/common.js';
import {
  type summaryQuerySchema,
  type summaryResponseSchema,
  type byCategoryQuerySchema,
  type byCategoryItemSchema,
  type monthlyTrendQuerySchema,
  type monthlyTrendItemSchema,
} from '../schemas/statistics.js';
import {
  type createTransactionSchema,
  type updateTransactionSchema,
  type transactionResponseSchema,
  type transactionQuerySchema,
  type transactionExportQuerySchema,
} from '../schemas/transaction.js';

// Auth
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// Transaction
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
export type TransactionExportQuery = z.infer<typeof transactionExportQuerySchema>;

// Category
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

// Statistics
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;
export type ByCategoryQuery = z.infer<typeof byCategoryQuerySchema>;
export type ByCategoryItem = z.infer<typeof byCategoryItemSchema>;
export type MonthlyTrendQuery = z.infer<typeof monthlyTrendQuerySchema>;
export type MonthlyTrendItem = z.infer<typeof monthlyTrendItemSchema>;

// Common
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiPaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: PaginationMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type TransactionType = 'INCOME' | 'EXPENSE';
