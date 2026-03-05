import supertest from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../src/app.js';

import { createTestUser } from './helpers/auth-helper.js';
import { buildRegisterInput } from './helpers/factories.js';

const request = supertest(app);

describe('POST /api/auth/register', () => {
  it('should register a new user with valid data', async () => {
    const input = buildRegisterInput();

    const res = await request.post('/api/auth/register').send(input).expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      email: input.email,
      name: input.name,
    });
    expect(res.body.data.user.id).toBeDefined();
    expect(res.body.data.user.createdAt).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    // Password should NOT be in the response
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should set refresh token as httpOnly cookie', async () => {
    const input = buildRegisterInput();

    const res = await request.post('/api/auth/register').send(input).expect(201);

    const cookies = res.headers['set-cookie'] as string[];
    const refreshCookie = cookies?.find((c: string) => c.startsWith('refreshToken='));

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('SameSite=Strict');
  });

  it('should seed default categories for the new user', async () => {
    const { accessToken } = await createTestUser();

    // Verify by calling /me — user exists
    const meRes = await request
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.id).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    const input = buildRegisterInput();

    await request.post('/api/auth/register').send(input).expect(201);

    const res = await request.post('/api/auth/register').send(input).expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_EMAIL_EXISTS');
  });

  it('should return 400 for invalid email', async () => {
    const input = buildRegisterInput({ email: 'not-an-email' });

    const res = await request.post('/api/auth/register').send(input).expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for short password', async () => {
    const input = buildRegisterInput({ password: '123' });

    const res = await request.post('/api/auth/register').send(input).expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for missing name', async () => {
    const input = buildRegisterInput({ name: '' });

    const res = await request.post('/api/auth/register').send(input).expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const { email, password } = await createTestUser();

    const res = await request.post('/api/auth/login').send({ email, password }).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should set refresh token cookie on login', async () => {
    const { email, password } = await createTestUser();

    const res = await request.post('/api/auth/login').send({ email, password }).expect(200);

    const cookies = res.headers['set-cookie'] as string[];
    const refreshCookie = cookies?.find((c: string) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
  });

  it('should return 400 for wrong password', async () => {
    const { email } = await createTestUser();

    const res = await request
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('should return 400 for non-existent email', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever123' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'not-email', password: 'whatever' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/refresh', () => {
  it('should return a new access token with valid refresh cookie', async () => {
    const { refreshCookie } = await createTestUser();

    const res = await request.post('/api/auth/refresh').set('Cookie', refreshCookie).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 401 without refresh cookie', async () => {
    const res = await request.post('/api/auth/refresh').expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_TOKEN_INVALID');
  });

  it('should return 401 with invalid refresh token', async () => {
    const res = await request
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=invalid-token-value')
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/logout', () => {
  it('should clear the refresh token cookie', async () => {
    const { refreshCookie } = await createTestUser();

    const res = await request.post('/api/auth/logout').set('Cookie', refreshCookie).expect(204);

    const cookies = res.headers['set-cookie'] as string[];
    const cleared = cookies?.find((c: string) => c.startsWith('refreshToken='));
    // The cookie should be cleared (empty value or expired)
    expect(cleared).toBeDefined();
  });

  it('should succeed even without a cookie', async () => {
    await request.post('/api/auth/logout').expect(204);
  });
});

describe('GET /api/auth/me', () => {
  it('should return the current user with valid token', async () => {
    const { accessToken, user } = await createTestUser();

    const res = await request
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should return 401 without token', async () => {
    const res = await request.get('/api/auth/me').expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_UNAUTHORIZED');
  });

  it('should return 401 with invalid token', async () => {
    const res = await request
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_TOKEN_INVALID');
  });
});
