import { useState } from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { type ByCategoryItem, type TransactionType } from '@shared/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

type CategoryBreakdownProps = {
  expenseData: ByCategoryItem[] | undefined;
  incomeData: ByCategoryItem[] | undefined;
  isLoading: boolean;
};

export function CategoryBreakdown({ expenseData, incomeData, isLoading }: CategoryBreakdownProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const data = type === 'EXPENSE' ? expenseData : incomeData;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>By Category</CardTitle>
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as TransactionType)}
          // as TransactionType: Tabs onValueChange returns string — we constrain to EXPENSE|INCOME via TabsTrigger values
        >
          <TabsList className="h-8">
            <TabsTrigger value="EXPENSE" className="text-xs">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="text-xs">
              Income
            </TabsTrigger>
          </TabsList>
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
            No {type === 'EXPENSE' ? 'expense' : 'income'} data
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
                          <p className="font-medium">{item.category.name}</p>
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
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span>{item.category.name}</span>
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
