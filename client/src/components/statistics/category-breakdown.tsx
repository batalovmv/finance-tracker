import { useState } from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { type ByCategoryItem, type TransactionType } from '@shared/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormatters } from '@/hooks/use-formatters';
import { translateCategory, useTranslation } from '@/i18n';

type CategoryBreakdownProps = {
  expenseData: ByCategoryItem[] | undefined;
  incomeData: ByCategoryItem[] | undefined;
  isLoading: boolean;
};

export function CategoryBreakdown({ expenseData, incomeData, isLoading }: CategoryBreakdownProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const data = type === 'EXPENSE' ? expenseData : incomeData;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('statistics.byCategory')}</CardTitle>
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as TransactionType)}
          // as TransactionType: Tabs onValueChange returns string — we constrain to EXPENSE|INCOME via TabsTrigger values
        >
          <TabsList className="h-8">
            <TabsTrigger value="EXPENSE" className="text-xs">
              {t('statistics.expenses')}
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="text-xs">
              {t('statistics.income')}
            </TabsTrigger>
          </TabsList>
          {/* Hidden panels satisfy aria-controls on each TabsTrigger */}
          <TabsContent value="EXPENSE" className="sr-only" />
          <TabsContent value="INCOME" className="sr-only" />
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
            <div className="w-full space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {type === 'EXPENSE' ? t('statistics.noExpenseData') : t('statistics.noIncomeData')}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="percentage"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {data.map((item) => (
                      <Cell key={item.category.id} fill={item.category.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      // as ByCategoryItem: recharts generic payload — our Pie data is ByCategoryItem[]
                      const item = payload[0].payload as ByCategoryItem;
                      return (
                        <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
                          <p className="font-medium">{translateCategory(item.category.name, t)}</p>
                          <p className="text-muted-foreground">
                            {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {data.map((item) => (
                <li key={item.category.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {/* Dynamic hex color from DB — cannot use Tailwind class */}
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span>{translateCategory(item.category.name, t)}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
