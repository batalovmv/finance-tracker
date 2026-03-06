import { http, HttpResponse } from 'msw';

import {
  type ByCategoryItem,
  type CategoryResponse,
  type MonthlyTrendItem,
  type SummaryResponse,
  type TransactionResponse,
  type UserResponse,
} from '@shared/types';

export const mockUser: UserResponse = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-expense-1',
    name: 'Food & Dining',
    type: 'EXPENSE',
    color: '#ef4444',
    icon: 'utensils',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-expense-2',
    name: 'Transportation',
    type: 'EXPENSE',
    color: '#f97316',
    icon: 'car',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-income-1',
    name: 'Salary',
    type: 'INCOME',
    color: '#22c55e',
    icon: 'briefcase',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const mockSummary: SummaryResponse = {
  totalIncome: '5000.00',
  totalExpense: '1250.00',
  balance: '3750.00',
};

export const mockByCategory: ByCategoryItem[] = [
  {
    category: { id: 'cat-expense-1', name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
    amount: '800.00',
    percentage: 64,
  },
  {
    category: { id: 'cat-expense-2', name: 'Transportation', color: '#f97316', icon: 'car' },
    amount: '450.00',
    percentage: 36,
  },
];

export const mockMonthlyTrend: MonthlyTrendItem[] = [
  { month: '2024-01', income: '5000.00', expense: '1250.00' },
  { month: '2024-02', income: '4800.00', expense: '1400.00' },
  { month: '2024-03', income: '5200.00', expense: '1100.00' },
];

export const mockTransactions: TransactionResponse[] = [
  {
    id: 'txn-1',
    amount: '1500.00',
    type: 'INCOME',
    description: 'Monthly salary',
    date: '2024-01-15T00:00:00.000Z',
    categoryId: 'cat-income-1',
    category: { id: 'cat-income-1', name: 'Salary', color: '#22c55e', icon: 'briefcase' },
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'txn-2',
    amount: '42.50',
    type: 'EXPENSE',
    description: 'Lunch with team',
    date: '2024-01-16T00:00:00.000Z',
    categoryId: 'cat-expense-1',
    category: { id: 'cat-expense-1', name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z',
  },
];

export const handlers = [
  // Auth
  http.post('*/api/auth/login', async ({ request }) => {
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
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Неверный email или пароль' },
      },
      { status: 400 },
    );
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; password: string };

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'AUTH_EMAIL_EXISTS', message: 'Email уже зарегистрирован' },
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

  // Categories
  http.get('*/api/categories', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const filtered = type ? mockCategories.filter((c) => c.type === type) : mockCategories;
    return HttpResponse.json({ success: true, data: filtered });
  }),

  // Transactions
  http.get('*/api/transactions', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let filtered = mockTransactions;
    if (type) {
      filtered = mockTransactions.filter((t) => t.type === type);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      meta: { page: 1, limit: 20, total: filtered.length, totalPages: 1 },
    });
  }),

  http.post('*/api/transactions', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 'txn-new',
          amount: body.amount,
          type: body.type,
          description: body.description ?? null,
          date: typeof body.date === 'string' ? body.date : new Date().toISOString(),
          categoryId: body.categoryId,
          category: mockCategories.find((c) => c.id === body.categoryId) ?? mockCategories[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  http.put('*/api/transactions/:id', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockTransactions.find((t) => t.id === params.id);
    const categoryId = (body.categoryId as string | undefined) ?? existing?.categoryId;

    return HttpResponse.json({
      success: true,
      data: {
        ...existing,
        ...body,
        category: mockCategories.find((c) => c.id === categoryId) ?? existing?.category,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.delete('*/api/transactions/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Statistics
  http.get('*/api/statistics/summary', () => {
    return HttpResponse.json({ success: true, data: mockSummary });
  }),

  http.get('*/api/statistics/by-category', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    // All mockByCategory items are EXPENSE — return empty for INCOME
    const filtered = type === 'INCOME' ? [] : mockByCategory;
    return HttpResponse.json({ success: true, data: filtered });
  }),

  http.get('*/api/statistics/monthly-trend', () => {
    return HttpResponse.json({ success: true, data: mockMonthlyTrend });
  }),
];
