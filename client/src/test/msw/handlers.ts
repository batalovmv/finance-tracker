import { http, HttpResponse } from 'msw';

import { type UserResponse } from '@shared/types';

export const mockUser: UserResponse = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const handlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    // request.json() returns unknown; cast is safe — we control the test request body
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: { user: mockUser, accessToken: 'test-access-token' },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' },
      },
      { status: 400 },
    );
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    // request.json() returns unknown; cast is safe — we control the test request body
    const body = (await request.json()) as { name: string; email: string; password: string };

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'AUTH_EMAIL_EXISTS', message: 'Email already registered' },
        },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: {
            id: '00000000-0000-4000-8000-000000000002',
            email: body.email,
            name: body.name,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          accessToken: 'new-access-token',
        },
      },
      { status: 201 },
    );
  }),

  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json(
      { success: false, error: { code: 'AUTH_TOKEN_INVALID', message: 'Invalid refresh token' } },
      { status: 401 },
    );
  }),

  http.post('*/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/api/auth/me', () => {
    return HttpResponse.json({ success: true, data: mockUser });
  }),
];
