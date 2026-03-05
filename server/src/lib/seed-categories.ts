import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@shared/constants.js';

import { prisma } from './prisma.js';

export async function seedCategoriesForUser(userId: string) {
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

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
}
