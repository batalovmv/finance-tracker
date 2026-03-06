import { type ReactNode } from 'react';

import { http, HttpResponse } from 'msw';

import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

import StatisticsPage from '../statistics-page';

vi.mock('recharts', async () => {
  const actual: Record<string, unknown> = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="chart-container">{children}</div>
    ),
  };
});

function renderStatistics() {
  return renderWithProviders(<StatisticsPage />);
}

describe('StatisticsPage', () => {
  it('should show loading skeletons while fetching', () => {
    renderStatistics();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render statistics heading', () => {
    renderStatistics();
    expect(screen.getByRole('heading', { name: /statistics/i })).toBeInTheDocument();
  });

  it('should render period selector with 12 months selected by default', () => {
    renderStatistics();
    expect(screen.getByRole('tab', { name: /this month/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /3 months/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /6 months/i })).toBeInTheDocument();
    const defaultTab = screen.getByRole('tab', { name: /12 months/i });
    expect(defaultTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should render summary cards with correct values', async () => {
    renderStatistics();
    expect(await screen.findByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    expect(screen.getByText('$3,750.00')).toBeInTheDocument();
  });

  it('should render category breakdown with expense data', async () => {
    renderStatistics();
    expect(await screen.findByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  it('should show expense amounts and percentages in category legend', async () => {
    renderStatistics();
    expect(await screen.findByText('$800.00 (64.0%)')).toBeInTheDocument();
    expect(screen.getByText('$450.00 (36.0%)')).toBeInTheDocument();
  });

  it('should toggle category breakdown to income and show empty state', async () => {
    const { user } = renderStatistics();
    await screen.findByText('Food & Dining');
    await user.click(screen.getByRole('tab', { name: /income/i }));
    expect(await screen.findByText('No income data')).toBeInTheDocument();
  });

  it('should render monthly trend chart heading', async () => {
    renderStatistics();
    expect(await screen.findByText('Monthly Trend')).toBeInTheDocument();
  });

  it('should render monthly trend chart with legend', async () => {
    renderStatistics();
    // Wait for trend data to load — "Income" and "Expenses" also appear in category tabs
    await waitFor(() => {
      expect(screen.getAllByText('Income')).toHaveLength(2);
    });
    expect(screen.getAllByText('Expenses')).toHaveLength(2);
  });

  it('should show empty trend state when no data', async () => {
    server.use(
      http.get('*/api/statistics/monthly-trend', () => {
        return HttpResponse.json({ success: true, data: [] });
      }),
    );
    renderStatistics();
    expect(await screen.findByText('No trend data')).toBeInTheDocument();
  });

  it('should show empty category state when no expense data', async () => {
    server.use(
      http.get('*/api/statistics/by-category', () => {
        return HttpResponse.json({ success: true, data: [] });
      }),
    );
    renderStatistics();
    expect(await screen.findByText('No expense data')).toBeInTheDocument();
  });

  it('should refetch summary with filtered data when changing period', async () => {
    const now = new Date();
    const thisMonthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
    const defaultSummary = { totalIncome: '5000.00', totalExpense: '1250.00', balance: '3750.00' };
    const filteredSummary = { totalIncome: '2000.00', totalExpense: '800.00', balance: '1200.00' };

    server.use(
      http.get('*/api/statistics/summary', ({ request }) => {
        const url = new URL(request.url);
        // "This Month" sends current month's first day as dateFrom
        if (url.searchParams.get('dateFrom') === thisMonthStart) {
          return HttpResponse.json({ success: true, data: filteredSummary });
        }
        return HttpResponse.json({ success: true, data: defaultSummary });
      }),
    );

    const { user } = renderStatistics();
    await screen.findByText('$5,000.00');

    await user.click(screen.getByRole('tab', { name: /this month/i }));
    expect(await screen.findByText('$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
  });
});
