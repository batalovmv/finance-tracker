import supertest from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';

import { app } from '../src/app.js';

import { createTestUser } from './helpers/auth-helper.js';
import { prisma } from './helpers/setup.js';

const request = supertest(app);

describe('Statistics API', () => {
  let token: string;
  let userId: string;
  let expenseCatId: string;
  let incomeCatId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    token = user.accessToken;
    userId = user.user.id;

    // Create categories
    const expenseCat = await prisma.category.create({
      data: { name: 'Food', type: 'EXPENSE', color: '#ef4444', icon: 'utensils', userId },
    });
    const incomeCat = await prisma.category.create({
      data: { name: 'Test Income', type: 'INCOME', color: '#22c55e', icon: 'briefcase', userId },
    });
    expenseCatId = expenseCat.id;
    incomeCatId = incomeCat.id;
  });

  describe('GET /api/statistics/summary', () => {
    it('should return zero totals when no transactions exist', async () => {
      const res = await request
        .get('/api/statistics/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        totalIncome: '0.00',
        totalExpense: '0.00',
        balance: '0.00',
      });
    });

    it('should return correct totals with transactions', async () => {
      await prisma.transaction.createMany({
        data: [
          {
            amount: 5000,
            type: 'INCOME',
            date: new Date('2025-01-15'),
            categoryId: incomeCatId,
            userId,
          },
          {
            amount: 3000,
            type: 'INCOME',
            date: new Date('2025-01-20'),
            categoryId: incomeCatId,
            userId,
          },
          {
            amount: 1200.5,
            type: 'EXPENSE',
            date: new Date('2025-01-10'),
            categoryId: expenseCatId,
            userId,
          },
          {
            amount: 800,
            type: 'EXPENSE',
            date: new Date('2025-01-25'),
            categoryId: expenseCatId,
            userId,
          },
        ],
      });

      const res = await request
        .get('/api/statistics/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.totalIncome).toBe('8000.00');
      expect(res.body.data.totalExpense).toBe('2000.50');
      expect(res.body.data.balance).toBe('5999.50');
    });

    it('should filter by date range', async () => {
      await prisma.transaction.createMany({
        data: [
          {
            amount: 1000,
            type: 'INCOME',
            date: new Date('2025-01-10'),
            categoryId: incomeCatId,
            userId,
          },
          {
            amount: 2000,
            type: 'INCOME',
            date: new Date('2025-02-10'),
            categoryId: incomeCatId,
            userId,
          },
          {
            amount: 500,
            type: 'EXPENSE',
            date: new Date('2025-01-15'),
            categoryId: expenseCatId,
            userId,
          },
        ],
      });

      const res = await request
        .get('/api/statistics/summary')
        .query({ dateFrom: '2025-01-01', dateTo: '2025-01-31' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.totalIncome).toBe('1000.00');
      expect(res.body.data.totalExpense).toBe('500.00');
      expect(res.body.data.balance).toBe('500.00');
    });

    it('should not include other users transactions', async () => {
      const otherUser = await createTestUser();
      const otherCat = await prisma.category.create({
        data: {
          name: 'Other',
          type: 'INCOME',
          color: '#000000',
          icon: 'circle',
          userId: otherUser.user.id,
        },
      });

      await prisma.transaction.createMany({
        data: [
          { amount: 1000, type: 'INCOME', date: new Date(), categoryId: incomeCatId, userId },
          {
            amount: 9999,
            type: 'INCOME',
            date: new Date(),
            categoryId: otherCat.id,
            userId: otherUser.user.id,
          },
        ],
      });

      const res = await request
        .get('/api/statistics/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.totalIncome).toBe('1000.00');
    });

    it('should return 401 without auth token', async () => {
      await request.get('/api/statistics/summary').expect(401);
    });
  });

  describe('GET /api/statistics/by-category', () => {
    it('should return empty array when no transactions exist', async () => {
      const res = await request
        .get('/api/statistics/by-category')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return amounts grouped by category', async () => {
      const foodCat2 = await prisma.category.create({
        data: { name: 'Transport', type: 'EXPENSE', color: '#f97316', icon: 'car', userId },
      });

      await prisma.transaction.createMany({
        data: [
          { amount: 400, type: 'EXPENSE', date: new Date(), categoryId: expenseCatId, userId },
          { amount: 200, type: 'EXPENSE', date: new Date(), categoryId: expenseCatId, userId },
          { amount: 400, type: 'EXPENSE', date: new Date(), categoryId: foodCat2.id, userId },
        ],
      });

      const res = await request
        .get('/api/statistics/by-category')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(2);

      // Sorted by amount descending — Food has 600, Transport has 400
      expect(res.body.data[0].category.name).toBe('Food');
      expect(res.body.data[0].amount).toBe('600.00');
      expect(res.body.data[0].percentage).toBe(60);

      expect(res.body.data[1].category.name).toBe('Transport');
      expect(res.body.data[1].amount).toBe('400.00');
      expect(res.body.data[1].percentage).toBe(40);
    });

    it('should filter by transaction type', async () => {
      await prisma.transaction.createMany({
        data: [
          { amount: 1000, type: 'INCOME', date: new Date(), categoryId: incomeCatId, userId },
          { amount: 500, type: 'EXPENSE', date: new Date(), categoryId: expenseCatId, userId },
        ],
      });

      const res = await request
        .get('/api/statistics/by-category')
        .query({ type: 'EXPENSE' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category.name).toBe('Food');
      expect(res.body.data[0].amount).toBe('500.00');
      expect(res.body.data[0].percentage).toBe(100);
    });

    it('should filter by date range', async () => {
      await prisma.transaction.createMany({
        data: [
          {
            amount: 100,
            type: 'EXPENSE',
            date: new Date('2025-01-15'),
            categoryId: expenseCatId,
            userId,
          },
          {
            amount: 200,
            type: 'EXPENSE',
            date: new Date('2025-03-15'),
            categoryId: expenseCatId,
            userId,
          },
        ],
      });

      const res = await request
        .get('/api/statistics/by-category')
        .query({ dateFrom: '2025-01-01', dateTo: '2025-01-31' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].amount).toBe('100.00');
    });

    it('should return 401 without auth token', async () => {
      await request.get('/api/statistics/by-category').expect(401);
    });
  });

  describe('GET /api/statistics/monthly-trend', () => {
    it('should return monthly data with default 12 months', async () => {
      const res = await request
        .get('/api/statistics/monthly-trend')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(12);

      // Each item should have month, income, expense
      for (const item of res.body.data) {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('income');
        expect(item).toHaveProperty('expense');
        expect(item.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });

    it('should respect months parameter', async () => {
      const res = await request
        .get('/api/statistics/monthly-trend')
        .query({ months: 3 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(3);
    });

    it('should aggregate transactions into correct months', async () => {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 15);

      await prisma.transaction.createMany({
        data: [
          { amount: 1000, type: 'INCOME', date: currentMonth, categoryId: incomeCatId, userId },
          { amount: 500, type: 'INCOME', date: currentMonth, categoryId: incomeCatId, userId },
          { amount: 300, type: 'EXPENSE', date: currentMonth, categoryId: expenseCatId, userId },
        ],
      });

      const res = await request
        .get('/api/statistics/monthly-trend')
        .query({ months: 1 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].income).toBe('1500.00');
      expect(res.body.data[0].expense).toBe('300.00');
    });

    it('should return zero for months without transactions', async () => {
      const res = await request
        .get('/api/statistics/monthly-trend')
        .query({ months: 2 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      for (const item of res.body.data) {
        expect(item.income).toBe('0.00');
        expect(item.expense).toBe('0.00');
      }
    });

    it('should validate months parameter', async () => {
      const res = await request
        .get('/api/statistics/monthly-trend')
        .query({ months: 0 })
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 without auth token', async () => {
      await request.get('/api/statistics/monthly-trend').expect(401);
    });
  });
});
