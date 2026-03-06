import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { type MonthlyTrendItem } from '@shared/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatMonth } from '@/lib/utils';

type MonthlyTrendChartProps = {
  data: MonthlyTrendItem[] | undefined;
  isLoading: boolean;
};

type ChartData = {
  label: string;
  income: number;
  expense: number;
};

function transformData(data: MonthlyTrendItem[]): ChartData[] {
  return data.map((item) => ({
    label: formatMonth(item.month),
    income: parseFloat(item.income) || 0,
    expense: parseFloat(item.expense) || 0,
  }));
}

export function MonthlyTrendChart({ data, isLoading }: MonthlyTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data ? transformData(data) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No trend data</p>
        ) : (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: number) => `$${v.toLocaleString('en-US')}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
                          {/* as string: label comes from XAxis dataKey="label" which is ChartData.label: string */}
                          <p className="font-medium">{label as string}</p>
                          {payload.map((entry) => (
                            // as string: dataKey is always a string key from ChartData
                            <p key={entry.dataKey as string} className="text-muted-foreground">
                              {entry.dataKey === 'income' ? 'Income' : 'Expenses'}:{' '}
                              {formatCurrency(String(entry.value ?? 0))}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-green-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-red-500" />
                <span>Expenses</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
