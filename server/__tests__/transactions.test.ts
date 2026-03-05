import supertest from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../src/app.js';

import { createTestUser } from './helpers/auth-helper.js';
import { buildCreateCategoryInput } from './helpers/factories.js';

const request = supertest(app);

// Helper: create a category and return its id
async function createCategory(token: string, type: 'INCOME' | 'EXPENSE' = 'EXPENSE') {
  const res = await request
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send(buildCreateCategoryInput({ type }))
    .expect(201);
  return res.body.data as { id: string; name: string; type: string };
}

// Helper: create a transaction and return its data
async function createTransaction(
  token: string,
  categoryId: string,
  overrides: Record<string, unknown> = {},
) {
  const res = await request
    .post('/api/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      amount: '100.00',
      type: 'EXPENSE',
      categoryId,
      date: new Date().toISOString(),
      description: 'Test transaction',
      ...overrides,
    })
    .expect(201);
  return res.body.data;
}

describe('POST /api/transactions', () => {
  it('should create a transaction with valid data', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    const res = await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: '250.50',
        type: 'EXPENSE',
        categoryId: category.id,
        date: '2025-06-15T10:00:00.000Z',
        description: 'Grocery shopping',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe('250.50');
    expect(res.body.data.type).toBe('EXPENSE');
    expect(res.body.data.description).toBe('Grocery shopping');
    expect(res.body.data.category.id).toBe(category.id);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('should create a transaction without description', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    const res = await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: '50.00',
        type: 'EXPENSE',
        categoryId: category.id,
        date: new Date().toISOString(),
      })
      .expect(201);

    expect(res.body.data.description).toBeNull();
  });

  it('should return 400 for invalid amount', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    const res = await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: '-10',
        type: 'EXPENSE',
        categoryId: category.id,
        date: new Date().toISOString(),
      })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for mismatched category type', async () => {
    const { accessToken } = await createTestUser();
    const incomeCategory = await createCategory(accessToken, 'INCOME');

    const res = await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: '100.00',
        type: 'EXPENSE',
        categoryId: incomeCategory.id,
        date: new Date().toISOString(),
      })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 for non-existent category', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: '100.00',
        type: 'EXPENSE',
        categoryId: '00000000-0000-0000-0000-000000000000',
        date: new Date().toISOString(),
      })
      .expect(404);

    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it("should return 403 for another user's category", async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();
    const category = await createCategory(token1);

    const res = await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        amount: '100.00',
        type: 'EXPENSE',
        categoryId: category.id,
        date: new Date().toISOString(),
      })
      .expect(403);

    expect(res.body.error.code).toBe('CATEGORY_FORBIDDEN');
  });

  it('should return 401 without auth token', async () => {
    await request
      .post('/api/transactions')
      .send({
        amount: '100.00',
        type: 'EXPENSE',
        categoryId: 'any',
        date: new Date().toISOString(),
      })
      .expect(401);
  });
});

describe('GET /api/transactions', () => {
  it('should return paginated transactions', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    // Create 3 transactions
    for (let i = 0; i < 3; i++) {
      await createTransaction(accessToken, category.id, { amount: `${(i + 1) * 10}.00` });
    }

    const res = await request
      .get('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.meta.total).toBe(3);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.totalPages).toBe(1);
  });

  it('should respect pagination params', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    for (let i = 0; i < 5; i++) {
      await createTransaction(accessToken, category.id);
    }

    const res = await request
      .get('/api/transactions?page=2&limit=2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(2);
    expect(res.body.meta.total).toBe(5);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('should filter by type', async () => {
    const { accessToken } = await createTestUser();
    const expenseCat = await createCategory(accessToken, 'EXPENSE');
    const incomeCat = await createCategory(accessToken, 'INCOME');

    await createTransaction(accessToken, expenseCat.id, { type: 'EXPENSE' });
    await createTransaction(accessToken, incomeCat.id, { type: 'INCOME', amount: '500.00' });

    const res = await request
      .get('/api/transactions?type=INCOME')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].type).toBe('INCOME');
  });

  it('should filter by categoryId', async () => {
    const { accessToken } = await createTestUser();
    const cat1 = await createCategory(accessToken);
    const cat2 = await createCategory(accessToken);

    await createTransaction(accessToken, cat1.id);
    await createTransaction(accessToken, cat2.id);

    const res = await request
      .get(`/api/transactions?categoryId=${cat1.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].categoryId).toBe(cat1.id);
  });

  it('should filter by date range', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    await createTransaction(accessToken, category.id, { date: '2025-01-15T00:00:00.000Z' });
    await createTransaction(accessToken, category.id, { date: '2025-06-15T00:00:00.000Z' });
    await createTransaction(accessToken, category.id, { date: '2025-12-15T00:00:00.000Z' });

    const res = await request
      .get('/api/transactions?dateFrom=2025-03-01&dateTo=2025-09-30')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it('should sort by amount ascending', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);

    await createTransaction(accessToken, category.id, { amount: '300.00' });
    await createTransaction(accessToken, category.id, { amount: '100.00' });
    await createTransaction(accessToken, category.id, { amount: '200.00' });

    const res = await request
      .get('/api/transactions?sort=amount:asc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const amounts = res.body.data.map((t: { amount: string }) => parseFloat(t.amount));
    expect(amounts).toEqual([100, 200, 300]);
  });

  it('should return 401 without auth token', async () => {
    await request.get('/api/transactions').expect(401);
  });

  it('should not return transactions from other users', async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();
    const category = await createCategory(token1);

    await createTransaction(token1, category.id);

    const res = await request
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });
});

describe('PUT /api/transactions/:id', () => {
  it('should update a transaction', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);
    const tx = await createTransaction(accessToken, category.id, { amount: '100.00' });

    const res = await request
      .put(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: '200.00', description: 'Updated' })
      .expect(200);

    expect(res.body.data.amount).toBe('200.00');
    expect(res.body.data.description).toBe('Updated');
  });

  it('should update transaction category', async () => {
    const { accessToken } = await createTestUser();
    const cat1 = await createCategory(accessToken);
    const cat2 = await createCategory(accessToken);
    const tx = await createTransaction(accessToken, cat1.id);

    const res = await request
      .put(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ categoryId: cat2.id })
      .expect(200);

    expect(res.body.data.categoryId).toBe(cat2.id);
  });

  it('should return 404 for non-existent transaction', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .put('/api/transactions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: '100.00' })
      .expect(404);

    expect(res.body.error.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it("should return 403 for another user's transaction", async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();
    const category = await createCategory(token1);
    const tx = await createTransaction(token1, category.id);

    const res = await request
      .put(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ amount: '999.00' })
      .expect(403);

    expect(res.body.error.code).toBe('TRANSACTION_FORBIDDEN');
  });

  it('should return 400 for empty update body', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);
    const tx = await createTransaction(accessToken, category.id);

    const res = await request
      .put(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should clear description with null', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);
    const tx = await createTransaction(accessToken, category.id, {
      description: 'Has description',
    });

    const res = await request
      .put(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: null })
      .expect(200);

    expect(res.body.data.description).toBeNull();
  });

  it('should return 401 without auth token', async () => {
    await request
      .put('/api/transactions/00000000-0000-0000-0000-000000000000')
      .send({ amount: '100.00' })
      .expect(401);
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('should delete a transaction', async () => {
    const { accessToken } = await createTestUser();
    const category = await createCategory(accessToken);
    const tx = await createTransaction(accessToken, category.id);

    await request
      .delete(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // Verify it's gone
    const res = await request
      .get('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });

  it('should return 404 for non-existent transaction', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .delete('/api/transactions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(res.body.error.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it("should return 403 for another user's transaction", async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();
    const category = await createCategory(token1);
    const tx = await createTransaction(token1, category.id);

    const res = await request
      .delete(`/api/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);

    expect(res.body.error.code).toBe('TRANSACTION_FORBIDDEN');
  });

  it('should return 401 without auth token', async () => {
    await request.delete('/api/transactions/00000000-0000-0000-0000-000000000000').expect(401);
  });
});
