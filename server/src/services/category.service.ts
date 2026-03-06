import { type Prisma } from '@prisma/client';

import { AppError, ErrorCode } from '@shared/errors.js';
import {
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryQuery,
  type CategoryResponse,
} from '@shared/types/index.js';

import { prisma } from '../lib/prisma.js';

function formatCategory(cat: {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  createdAt: Date;
}): CategoryResponse {
  return {
    id: cat.id,
    name: cat.name,
    // Safe: Prisma stores only values from the TransactionType enum
    type: cat.type as CategoryResponse['type'],
    color: cat.color,
    icon: cat.icon,
    createdAt: cat.createdAt.toISOString(),
  };
}

export async function list(userId: string, query: CategoryQuery) {
  const where: Prisma.CategoryWhereInput = { userId };

  if (query.type) {
    where.type = query.type;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return categories.map(formatCategory);
}

export async function create(userId: string, input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({
    where: {
      name_type_userId: {
        name: input.name,
        type: input.type,
        userId,
      },
    },
  });

  if (existing) {
    throw AppError.conflict(
      ErrorCode.CATEGORY_DUPLICATE,
      'Category with this name and type already exists',
    );
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      type: input.type,
      color: input.color ?? '#6366f1',
      icon: input.icon ?? 'circle',
      userId,
    },
  });

  return formatCategory(category);
}

export async function update(userId: string, categoryId: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw AppError.notFound(ErrorCode.CATEGORY_NOT_FOUND, 'Category not found');
  }

  if (category.userId !== userId) {
    throw AppError.forbidden(ErrorCode.CATEGORY_FORBIDDEN, 'Access denied to this category');
  }

  // Check for duplicate name if name is being updated
  if (input.name && input.name !== category.name) {
    const duplicate = await prisma.category.findUnique({
      where: {
        name_type_userId: {
          name: input.name,
          type: category.type,
          userId,
        },
      },
    });

    if (duplicate) {
      throw AppError.conflict(
        ErrorCode.CATEGORY_DUPLICATE,
        'Category with this name already exists',
      );
    }
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.icon !== undefined && { icon: input.icon }),
    },
  });

  return formatCategory(updated);
}

export async function remove(userId: string, categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw AppError.notFound(ErrorCode.CATEGORY_NOT_FOUND, 'Category not found');
  }

  if (category.userId !== userId) {
    throw AppError.forbidden(ErrorCode.CATEGORY_FORBIDDEN, 'Access denied to this category');
  }

  // Check if category has transactions
  const transactionCount = await prisma.transaction.count({
    where: { categoryId },
  });

  if (transactionCount > 0) {
    throw AppError.conflict(
      ErrorCode.CATEGORY_HAS_TRANSACTIONS,
      `Cannot delete category with ${transactionCount} transaction(s). Reassign them first.`,
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });
}
