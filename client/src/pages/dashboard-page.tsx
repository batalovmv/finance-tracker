import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { useByCategory, useSummary } from '@/hooks/use-statistics';
import { useTransactions } from '@/hooks/use-transactions';

export default function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useSummary();
  const { data: expenseData, isLoading: isExpenseLoading } = useByCategory({ type: 'EXPENSE' });
  const { data: recentData, isLoading: isRecentLoading } = useTransactions({
    limit: 5,
    sort: 'date:desc',
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <SummaryCards data={summary} isLoading={isSummaryLoading} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions data={recentData?.data} isLoading={isRecentLoading} />
        <ExpenseChart data={expenseData} isLoading={isExpenseLoading} />
      </div>
    </div>
  );
}
