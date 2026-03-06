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
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('should render summary card titles', async () => {
    renderDashboard();
    expect(await screen.findByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
  });

  it('should render summary cards with correct values', async () => {
    renderDashboard();
    expect(await screen.findByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    expect(screen.getByText('$3,750.00')).toBeInTheDocument();
  });

  it('should render recent transactions', async () => {
    renderDashboard();
    expect(await screen.findByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Lunch with team')).toBeInTheDocument();
  });

  it('should have View all link pointing to transactions page', async () => {
    renderDashboard();
    await screen.findByText('Recent Transactions');
    const link = screen.getByRole('link', { name: /view all/i });
    expect(link).toHaveAttribute('href', '/transactions');
  });

  it('should render expense chart with category legend', async () => {
    renderDashboard();
    expect(await screen.findByText('$800.00')).toBeInTheDocument();
    expect(screen.getByText('Expenses by Category')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
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
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument();
  });

  it('should show empty state when no expense data', async () => {
    server.use(
      http.get('*/api/statistics/by-category', () => {
        return HttpResponse.json({ success: true, data: [] });
      }),
    );

    renderDashboard();
    expect(await screen.findByText('No expense data')).toBeInTheDocument();
  });
});
