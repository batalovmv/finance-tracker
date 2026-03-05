import supertest from 'supertest';
import { describe, it, expect } from 'vitest';

import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@shared/constants.js';

import { app } from '../src/app.js';

import { createTestUser } from './helpers/auth-helper.js';
import { buildCreateCategoryInput } from './helpers/factories.js';

const request = supertest(app);

describe('GET /api/categories', () => {
  it('should return seeded categories for a new user', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const seededTotal = DEFAULT_EXPENSE_CATEGORIES.length + DEFAULT_INCOME_CATEGORIES.length;
    expect(res.body.data.length).toBe(seededTotal);
  });

  it('should filter categories by type', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .get('/api/categories?type=INCOME')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.length).toBe(DEFAULT_INCOME_CATEGORIES.length);
    expect(res.body.data.every((c: { type: string }) => c.type === 'INCOME')).toBe(true);
  });

  it('should return 401 without auth token', async () => {
    await request.get('/api/categories').expect(401);
  });

  it('should not return categories from other users', async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();

    // Create a custom category for user 1
    await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send(buildCreateCategoryInput({ name: 'User1 Only' }))
      .expect(201);

    // User 2 should not see it
    const res = await request
      .get('/api/categories')
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);

    const names = res.body.data.map((c: { name: string }) => c.name);
    expect(names).not.toContain('User1 Only');
  });
});

describe('POST /api/categories', () => {
  it('should create a new category', async () => {
    const { accessToken } = await createTestUser();
    const input = buildCreateCategoryInput({ name: 'Custom Category' });

    const res = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(input)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Custom Category');
    expect(res.body.data.type).toBe('EXPENSE');
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('should return 409 for duplicate name+type', async () => {
    const { accessToken } = await createTestUser();
    const input = buildCreateCategoryInput({ name: 'Duplicate Test' });

    await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(input)
      .expect(201);

    const res = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(input)
      .expect(409);

    expect(res.body.error.code).toBe('CATEGORY_DUPLICATE');
  });

  it('should allow same name with different type', async () => {
    const { accessToken } = await createTestUser();

    await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Both Types', type: 'EXPENSE' }))
      .expect(201);

    await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Both Types', type: 'INCOME' }))
      .expect(201);
  });

  it('should return 400 for missing name', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'EXPENSE' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 401 without auth token', async () => {
    await request.post('/api/categories').send(buildCreateCategoryInput()).expect(401);
  });

  it('should return 400 for invalid color format', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ color: 'red' }))
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/categories/:id', () => {
  it('should update a category', async () => {
    const { accessToken } = await createTestUser();

    const created = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Before Update' }))
      .expect(201);

    const res = await request
      .put(`/api/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'After Update', color: '#00ff00' })
      .expect(200);

    expect(res.body.data.name).toBe('After Update');
    expect(res.body.data.color).toBe('#00ff00');
  });

  it('should return 404 for non-existent category', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .put('/api/categories/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Nope' })
      .expect(404);

    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it("should return 403 for another user's category", async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();

    const created = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send(buildCreateCategoryInput({ name: 'Owner Only' }))
      .expect(201);

    const res = await request
      .put(`/api/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Hijacked' })
      .expect(403);

    expect(res.body.error.code).toBe('CATEGORY_FORBIDDEN');
  });

  it('should return 401 without auth token', async () => {
    await request
      .put('/api/categories/00000000-0000-0000-0000-000000000000')
      .send({ name: 'No Auth' })
      .expect(401);
  });

  it('should return 409 when updating to duplicate name', async () => {
    const { accessToken } = await createTestUser();

    await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Existing Name', type: 'EXPENSE' }))
      .expect(201);

    const second = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Will Rename', type: 'EXPENSE' }))
      .expect(201);

    const res = await request
      .put(`/api/categories/${second.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Existing Name' })
      .expect(409);

    expect(res.body.error.code).toBe('CATEGORY_DUPLICATE');
  });

  it('should return 400 for empty update body', async () => {
    const { accessToken } = await createTestUser();

    const created = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Empty Update' }))
      .expect(201);

    const res = await request
      .put(`/api/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/categories/:id', () => {
  it('should delete a category without transactions', async () => {
    const { accessToken } = await createTestUser();

    const created = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'To Delete' }))
      .expect(201);

    await request
      .delete(`/api/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // Verify it's gone
    const listRes = await request
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const names = listRes.body.data.map((c: { name: string }) => c.name);
    expect(names).not.toContain('To Delete');
  });

  it('should return 401 without auth token', async () => {
    await request.delete('/api/categories/00000000-0000-0000-0000-000000000000').expect(401);
  });

  it('should return 409 when category has transactions', async () => {
    const { accessToken } = await createTestUser();

    // Create a category
    const catRes = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateCategoryInput({ name: 'Has Txns', type: 'EXPENSE' }))
      .expect(201);

    // Create a transaction using this category
    await request
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: '50.00',
        type: 'EXPENSE',
        categoryId: catRes.body.data.id,
        date: new Date().toISOString(),
      })
      .expect(201);

    // Try to delete — should fail
    const res = await request
      .delete(`/api/categories/${catRes.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);

    expect(res.body.error.code).toBe('CATEGORY_HAS_TRANSACTIONS');
  });

  it('should return 404 for non-existent category', async () => {
    const { accessToken } = await createTestUser();

    const res = await request
      .delete('/api/categories/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it("should return 403 for another user's category", async () => {
    const { accessToken: token1 } = await createTestUser();
    const { accessToken: token2 } = await createTestUser();

    const created = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send(buildCreateCategoryInput({ name: 'Not Yours' }))
      .expect(201);

    const res = await request
      .delete(`/api/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);

    expect(res.body.error.code).toBe('CATEGORY_FORBIDDEN');
  });
});
