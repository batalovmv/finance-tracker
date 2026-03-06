import { type ReactNode } from 'react';

import { http, HttpResponse } from 'msw';

import { server } from '@/test/msw/server';
import { renderWithProviders, screen } from '@/test/test-utils';

import DashboardPage from '../dashboard-page';

vi.mock('recharts', async () => {
  const actual: Record<string, unknown> = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="chart-container">{children}</div>
    ),
  };
});

function renderDashboard() {
  return renderWithProviders(<DashboardPage />);
}

describe('DashboardPage', () => {
  it('should show loading skeletons while fetching', () => {
    renderDashboard();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render dashboard heading', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: /главная/i })).toBeInTheDocument();
  });

  it('should render summary card titles', async () => {
    renderDashboard();
    expect(await screen.findByText('Всего доходов')).toBeInTheDocument();
    expect(screen.getByText('Всего расходов')).toBeInTheDocument();
    expect(screen.getByText('Баланс')).toBeInTheDocument();
  });

  it('should render summary cards with correct values', async () => {
    renderDashboard();
    expect(await screen.findByText(/5\s000,00\s₽/)).toBeInTheDocument();
    expect(screen.getByText(/1\s250,00\s₽/)).toBeInTheDocument();
    expect(screen.getByText(/3\s750,00\s₽/)).toBeInTheDocument();
  });

  it('should render recent transactions', async () => {
    renderDashboard();
    expect(await screen.findByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Lunch with team')).toBeInTheDocument();
  });

  it('should have View all link pointing to transactions page', async () => {
    renderDashboard();
    await screen.findByText('Последние транзакции');
    const link = screen.getByRole('link', { name: /все/i });
    expect(link).toHaveAttribute('href', '/transactions');
  });

  it('should render expense chart with category legend', async () => {
    renderDashboard();
    expect(await screen.findByText(/800,00\s₽/)).toBeInTheDocument();
    expect(screen.getByText('Расходы по категориям')).toBeInTheDocument();
    expect(screen.getByText('Транспорт')).toBeInTheDocument();
    expect(screen.getByText(/450,00\s₽/)).toBeInTheDocument();
  });

  it('should show empty state when no recent transactions', async () => {
    server.use(
      http.get('*/api/transactions', () => {
        return HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, limit: 5, total: 0, totalPages: 0 },
        });
      }),
    );

    renderDashboard();
    expect(await screen.findByText('Транзакций пока нет')).toBeInTheDocument();
  });

  it('should show error alert when data fetch fails', async () => {
    server.use(http.get('*/api/statistics/summary', () => HttpResponse.error()));

    renderDashboard();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/не удалось загрузить данные/i)).toBeInTheDocument();
  });

  it('should show empty state when no expense data', async () => {
    server.use(
      http.get('*/api/statistics/by-category', () => {
        return HttpResponse.json({ success: true, data: [] });
      }),
    );

    renderDashboard();
    expect(await screen.findByText('Нет данных о расходах')).toBeInTheDocument();
  });
});
