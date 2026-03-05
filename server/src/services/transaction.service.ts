import { type Prisma } from '@prisma/client';

import { AppError, ErrorCode } from '@shared/errors.js';
import {
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type TransactionQuery,
  type TransactionResponse,
  type PaginationMeta,
} from '@shared/types/index.js';

import { prisma } from '../lib/prisma.js';

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;

function formatTransaction(tx: TransactionWithCategory): TransactionResponse {
  return {
    id: tx.id,
    amount: tx.amount.toFixed(2),
    // Safe: Prisma stores only values from the TransactionType enum
    type: tx.type as TransactionResponse['type'],
    description: tx.description,
    date: tx.date.toISOString(),
    categoryId: tx.categoryId,
    category: {
      id: tx.category.id,
      name: tx.category.name,
      color: tx.category.color,
      icon: tx.category.icon,
    },
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}

function parseSortParam(sort?: string): { field: string; direction: 'asc' | 'desc' } {
  if (!sort) return { field: 'date', direction: 'desc' };

  const [field, direction] = sort.split(':');
  const allowedFields = ['date', 'amount', 'createdAt'];
  const validField = allowedFields.includes(field) ? field : 'date';
  const validDirection = direction === 'asc' ? 'asc' : 'desc';

  return { field: validField, direction: validDirection };
}

function buildWhereClause(
  userId: string,
  query: Pick<TransactionQuery, 'categoryId' | 'type' | 'dateFrom' | 'dateTo'>,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.dateFrom || query.dateTo) {
    where.date = {
      ...(query.dateFrom && { gte: query.dateFrom }),
      ...(query.dateTo && { lte: query.dateTo }),
    };
  }

  return where;
}

export async function list(userId: string, query: TransactionQuery) {
  const where = buildWhereClause(userId, query);

  const { field, direction } = parseSortParam(query.sort);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { [field]: direction },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return { data: transactions.map(formatTransaction), meta };
}

export async function listAll(
  userId: string,
  query: Pick<TransactionQuery, 'categoryId' | 'type' | 'dateFrom' | 'dateTo' | 'sort'>,
): Promise<TransactionResponse[]> {
  const where = buildWhereClause(userId, query);
  const { field, direction } = parseSortParam(query.sort);

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { [field]: direction },
  });

  return transactions.map(formatTransaction);
}

export async function create(userId: string, input: CreateTransactionInput) {
  // Verify category belongs to user
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw AppError.notFound(ErrorCode.CATEGORY_NOT_FOUND, 'Category not found');
  }

  if (category.userId !== userId) {
    throw AppError.forbidden(ErrorCode.CATEGORY_FORBIDDEN, 'You do not own this category');
  }

  // Verify category type matches transaction type
  if (category.type !== input.type) {
    throw AppError.badRequest(
      ErrorCode.VALIDATION_ERROR,
      `Category type "${category.type}" does not match transaction type "${input.type}"`,
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: input.amount,
      type: input.type,
      description: input.description ?? null,
      date: input.date,
      categoryId: input.categoryId,
      userId,
    },
    include: { category: true },
  });

  return formatTransaction(transaction);
}

export async function update(userId: string, transactionId: string, input: UpdateTransactionInput) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw AppError.notFound(ErrorCode.TRANSACTION_NOT_FOUND, 'Transaction not found');
  }

  if (transaction.userId !== userId) {
    throw AppError.forbidden(ErrorCode.TRANSACTION_FORBIDDEN, 'You do not own this transaction');
  }

  // Validate category/type consistency when either is being updated
  if (input.categoryId || input.type) {
    const categoryId = input.categoryId ?? transaction.categoryId;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw AppError.notFound(ErrorCode.CATEGORY_NOT_FOUND, 'Category not found');
    }

    if (category.userId !== userId) {
      throw AppError.forbidden(ErrorCode.CATEGORY_FORBIDDEN, 'You do not own this category');
    }

    const effectiveType = input.type ?? transaction.type;
    if (category.type !== effectiveType) {
      throw AppError.badRequest(
        ErrorCode.VALIDATION_ERROR,
        `Category type "${category.type}" does not match transaction type "${effectiveType}"`,
      );
    }
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.description !== undefined && { description: input.description ?? null }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
    },
    include: { category: true },
  });

  return formatTransaction(updated);
}

export async function remove(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw AppError.notFound(ErrorCode.TRANSACTION_NOT_FOUND, 'Transaction not found');
  }

  if (transaction.userId !== userId) {
    throw AppError.forbidden(ErrorCode.TRANSACTION_FORBIDDEN, 'You do not own this transaction');
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });
}
