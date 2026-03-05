import { type Prisma } from '@prisma/client';

import {
  type SummaryQuery,
  type SummaryResponse,
  type ByCategoryQuery,
  type ByCategoryItem,
  type MonthlyTrendQuery,
  type MonthlyTrendItem,
} from '@shared/types/index.js';

import { prisma } from '../lib/prisma.js';

function buildDateFilter(query: { dateFrom?: Date; dateTo?: Date }): Prisma.TransactionWhereInput {
  if (!query.dateFrom && !query.dateTo) return {};

  return {
    date: {
      ...(query.dateFrom && { gte: query.dateFrom }),
      ...(query.dateTo && { lte: query.dateTo }),
    },
  };
}

export async function getSummary(userId: string, query: SummaryQuery): Promise<SummaryResponse> {
  const dateFilter = buildDateFilter(query);

  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', ...dateFilter },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', ...dateFilter },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeResult._sum.amount?.toFixed(2) ?? '0.00';
  const totalExpense = expenseResult._sum.amount?.toFixed(2) ?? '0.00';
  const balance = (parseFloat(totalIncome) - parseFloat(totalExpense)).toFixed(2);

  return { totalIncome, totalExpense, balance };
}

export async function getByCategory(
  userId: string,
  query: ByCategoryQuery,
): Promise<ByCategoryItem[]> {
  const dateFilter = buildDateFilter(query);
  const typeFilter: Prisma.TransactionWhereInput = query.type ? { type: query.type } : {};

  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, ...dateFilter, ...typeFilter },
    _sum: { amount: true },
  });

  if (grouped.length === 0) return [];

  const total = grouped.reduce((sum, g) => sum + (g._sum.amount?.toNumber() ?? 0), 0);

  const categoryIds = grouped.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const cat = categoryMap.get(g.categoryId);
      if (!cat) return null;

      const amount = g._sum.amount?.toNumber() ?? 0;

      return {
        category: {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        },
        amount: amount.toFixed(2),
        percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
      };
    })
    .filter((item): item is ByCategoryItem => item !== null)
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
}

export async function getMonthlyTrend(
  userId: string,
  query: MonthlyTrendQuery,
): Promise<MonthlyTrendItem[]> {
  const months = query.months;
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1));

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    select: {
      amount: true,
      type: true,
      date: true,
    },
  });

  // Build month buckets (using UTC to match DB-stored UTC dates)
  const monthMap = new Map<string, { income: number; expense: number }>();

  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1 + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, { income: 0, expense: 0 });
  }

  // Aggregate transactions into buckets
  for (const tx of transactions) {
    const key = `${tx.date.getUTCFullYear()}-${String(tx.date.getUTCMonth() + 1).padStart(2, '0')}`;
    const bucket = monthMap.get(key);
    if (bucket) {
      if (tx.type === 'INCOME') {
        bucket.income += tx.amount.toNumber();
      } else {
        bucket.expense += tx.amount.toNumber();
      }
    }
  }

  return Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    income: data.income.toFixed(2),
    expense: data.expense.toFixed(2),
  }));
}
