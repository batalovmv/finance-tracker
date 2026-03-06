import { useState } from 'react';

import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CategoryBreakdown } from '@/components/statistics/category-breakdown';
import { MonthlyTrendChart } from '@/components/statistics/monthly-trend-chart';
import { PeriodSelector } from '@/components/statistics/period-selector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useByCategory, useMonthlyTrend, useSummary } from '@/hooks/use-statistics';
import { useTranslation } from '@/i18n';

function getDateRange(months: number) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const dateTo = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const start = new Date(Date.UTC(y, m - months + 1, 1));
  const sy = start.getUTCFullYear();
  const sm = start.getUTCMonth();
  const dateFrom = `${sy}-${String(sm + 1).padStart(2, '0')}-01`;
  return { dateFrom, dateTo };
}

export default function StatisticsPage() {
  const { t } = useTranslation();
  const [months, setMonths] = useState(12);
  const dateRange = getDateRange(months);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useSummary(dateRange);
  const {
    data: expenseData,
    isLoading: isExpenseLoading,
    isError: isExpenseError,
  } = useByCategory({
    ...dateRange,
    type: 'EXPENSE',
  });
  const {
    data: incomeData,
    isLoading: isIncomeLoading,
    isError: isIncomeError,
  } = useByCategory({
    ...dateRange,
    type: 'INCOME',
  });
  const {
    data: trendData,
    isLoading: isTrendLoading,
    isError: isTrendError,
  } = useMonthlyTrend(months);

  const hasError = isSummaryError || isExpenseError || isIncomeError || isTrendError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t('statistics.title')}</h1>
        <PeriodSelector value={String(months)} onChange={(v) => setMonths(Number(v))} />
      </div>
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>{t('statistics.loadError')}</AlertDescription>
        </Alert>
      )}
      <SummaryCards data={summary} isLoading={isSummaryLoading} />
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown
          expenseData={expenseData}
          incomeData={incomeData}
          isLoading={isExpenseLoading || isIncomeLoading}
        />
        <MonthlyTrendChart data={trendData} isLoading={isTrendLoading} />
      </div>
    </div>
  );
}
