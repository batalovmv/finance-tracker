import supertest from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';

import { app } from '../src/app.js';

import { createTestUser } from './helpers/auth-helper.js';
import { prisma } from './helpers/setup.js';

const request = supertest(app);

describe('CSV Export API', () => {
  let token: string;
  let userId: string;
  let expenseCatId: string;
  let incomeCatId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    token = user.accessToken;
    userId = user.user.id;

    const expenseCat = await prisma.category.create({
      data: { name: 'Test Food', type: 'EXPENSE', color: '#ef4444', icon: 'utensils', userId },
    });
    const incomeCat = await prisma.category.create({
      data: { name: 'Test Income', type: 'INCOME', color: '#22c55e', icon: 'briefcase', userId },
    });
    expenseCatId = expenseCat.id;
    incomeCatId = incomeCat.id;
  });

  describe('GET /api/transactions/export', () => {
    it('should return CSV with headers when no transactions', async () => {
      const res = await request
        .get('/api/transactions/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('transactions.csv');
      expect(res.text).toBe('Date,Type,Category,Amount,Description');
    });

    it('should export all transactions as CSV', async () => {
      await prisma.transaction.createMany({
        data: [
          {
            amount: 5000,
            type: 'INCOME',
            date: new Date('2025-01-15'),
            description: 'Monthly salary',
            categoryId: incomeCatId,
            userId,
          },
          {
            amount: 45.5,
            type: 'EXPENSE',
            date: new Date('2025-01-16'),
            description: 'Lunch',
            categoryId: expenseCatId,
            userId,
          },
        ],
      });

      const res = await request
        .get('/api/transactions/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const lines = res.text.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('Date,Type,Category,Amount,Description');

      // Check that income has positive amount
      const incomeLine = lines.find((l: string) => l.includes('INCOME'));
      expect(incomeLine).toContain('5000.00');
      expect(incomeLine).toContain('Test Income');

      // Check that expense has negative amount
      const expenseLine = lines.find((l: string) => l.includes('EXPENSE'));
      expect(expenseLine).toContain('-45.50');
      expect(expenseLine).toContain('Test Food');
    });

    it('should escape CSV fields with commas', async () => {
      await prisma.transaction.create({
        data: {
          amount: 100,
          type: 'EXPENSE',
          date: new Date('2025-01-15'),
          description: 'Coffee, tea, snacks',
          categoryId: expenseCatId,
          userId,
        },
      });

      const res = await request
        .get('/api/transactions/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const lines = res.text.split('\n');
      expect(lines[1]).toContain('"Coffee, tea, snacks"');
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
        .get('/api/transactions/export')
        .query({ dateFrom: '2025-01-01', dateTo: '2025-01-31' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const lines = res.text.split('\n');
      expect(lines).toHaveLength(2); // header + 1 transaction
    });

    it('should filter by type', async () => {
      await prisma.transaction.createMany({
        data: [
          { amount: 1000, type: 'INCOME', date: new Date(), categoryId: incomeCatId, userId },
          { amount: 500, type: 'EXPENSE', date: new Date(), categoryId: expenseCatId, userId },
        ],
      });

      const res = await request
        .get('/api/transactions/export')
        .query({ type: 'EXPENSE' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const lines = res.text.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[1]).toContain('EXPENSE');
    });

    it('should not include other users transactions', async () => {
      const otherUser = await createTestUser();
      const otherCat = await prisma.category.create({
        data: {
          name: 'Other',
          type: 'EXPENSE',
          color: '#000000',
          icon: 'circle',
          userId: otherUser.user.id,
        },
      });

      await prisma.transaction.createMany({
        data: [
          { amount: 100, type: 'EXPENSE', date: new Date(), categoryId: expenseCatId, userId },
          {
            amount: 9999,
            type: 'EXPENSE',
            date: new Date(),
            categoryId: otherCat.id,
            userId: otherUser.user.id,
          },
        ],
      });

      const res = await request
        .get('/api/transactions/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const lines = res.text.split('\n');
      expect(lines).toHaveLength(2); // header + 1 own transaction
      expect(res.text).not.toContain('9999');
    });

    it('should handle null descriptions', async () => {
      await prisma.transaction.create({
        data: {
          amount: 50,
          type: 'EXPENSE',
          date: new Date('2025-01-15'),
          categoryId: expenseCatId,
          userId,
        },
      });

      const res = await request
        .get('/api/transactions/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const lines = res.text.split('\n');
      // Last field should be empty for null description
      expect(lines[1]).toMatch(/,$/);
    });

    it('should return 401 without auth token', async () => {
      await request.get('/api/transactions/export').expect(401);
    });
  });
});
