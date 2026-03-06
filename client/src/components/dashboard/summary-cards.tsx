import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

import { type SummaryResponse } from '@shared/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormatters } from '@/hooks/use-formatters';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

type SummaryCardsProps = {
  data: SummaryResponse | undefined;
  isLoading: boolean;
};

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  const cardConfig = [
    {
      title: t('dashboard.totalIncome'),
      key: 'totalIncome' as const,
      icon: ArrowUpRight,
      className: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('dashboard.totalExpenses'),
      key: 'totalExpense' as const,
      icon: ArrowDownLeft,
      className: 'text-red-600 dark:text-red-400',
    },
    {
      title: t('dashboard.balance'),
      key: 'balance' as const,
      icon: Wallet,
      className: 'text-blue-600 dark:text-blue-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cardConfig.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon aria-hidden="true" className={cn('h-4 w-4', card.className)} />
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                'text-2xl font-bold',
                card.key === 'balance' && data && parseFloat(data.balance) < 0
                  ? 'text-red-600 dark:text-red-400'
                  : card.className,
              )}
            >
              {data ? formatCurrency(data[card.key]) : formatCurrency('0.00')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
