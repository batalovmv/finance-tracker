import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useByCategory, useSummary } from '@/hooks/use-statistics';
import { useTransactions } from '@/hooks/use-transactions';
import { useTranslation } from '@/i18n';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useSummary();
  const {
    data: expenseData,
    isLoading: isExpenseLoading,
    isError: isExpenseError,
  } = useByCategory({ type: 'EXPENSE' });
  const {
    data: recentData,
    isLoading: isRecentLoading,
    isError: isRecentError,
  } = useTransactions({
    limit: 5,
    sort: 'date:desc',
  });

  const hasError = isSummaryError || isExpenseError || isRecentError;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>{t('dashboard.loadError')}</AlertDescription>
        </Alert>
      )}
      <SummaryCards data={summary} isLoading={isSummaryLoading} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions data={recentData?.data} isLoading={isRecentLoading} />
        <ExpenseChart data={expenseData} isLoading={isExpenseLoading} />
      </div>
    </div>
  );
}
