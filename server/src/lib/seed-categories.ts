import { type PrismaClient } from '@prisma/client';

import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@shared/constants.js';

import { prisma as defaultPrisma } from './prisma.js';

export async function seedCategoriesForUser(
  userId: string,
  client: Pick<PrismaClient, 'category'> = defaultPrisma,
) {
  const categories = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      ...c,
      type: 'EXPENSE' as const,
      userId,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      ...c,
      type: 'INCOME' as const,
      userId,
    })),
  ];

  await client.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
}
