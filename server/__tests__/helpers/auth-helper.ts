import supertest from 'supertest';

import { app } from '../../src/app.js';

import { buildRegisterInput } from './factories.js';

const request = supertest(app);

export async function createTestUser(
  overrides: { email?: string; password?: string; name?: string } = {},
) {
  const input = buildRegisterInput(overrides);

  const res = await request.post('/api/auth/register').send(input).expect(201);

  const cookies = res.headers['set-cookie'] as string[] | undefined;
  const refreshCookie = cookies?.find((c: string) => c.startsWith('refreshToken='));

  return {
    user: res.body.data.user,
    accessToken: res.body.data.accessToken as string,
    refreshCookie: refreshCookie ?? '',
    password: input.password,
    email: input.email,
  };
}

export async function getAuthToken(email: string, password: string): Promise<string> {
  const res = await request.post('/api/auth/login').send({ email, password }).expect(200);

  return res.body.data.accessToken as string;
}
