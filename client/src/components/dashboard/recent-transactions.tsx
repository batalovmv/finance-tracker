import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { type TransactionResponse } from '@shared/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

type RecentTransactionsProps = {
  data: TransactionResponse[] | undefined;
  isLoading: boolean;
};

export function RecentTransactions({ data, isLoading }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/transactions">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {data.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{txn.description ?? txn.category.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{txn.category.name}</span>
                    <span>&middot;</span>
                    <span>{formatDate(txn.date)}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    txn.type === 'INCOME'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {txn.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
