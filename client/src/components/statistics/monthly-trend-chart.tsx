import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { type MonthlyTrendItem } from '@shared/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormatters } from '@/hooks/use-formatters';
import { useTranslation } from '@/i18n';

type MonthlyTrendChartProps = {
  data: MonthlyTrendItem[] | undefined;
  isLoading: boolean;
};

type ChartData = {
  label: string;
  income: number;
  expense: number;
};

export function MonthlyTrendChart({ data, isLoading }: MonthlyTrendChartProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatMonth } = useFormatters();

  function transformData(items: MonthlyTrendItem[]): ChartData[] {
    return items.map((item) => ({
      label: formatMonth(item.month),
      income: parseFloat(item.income) || 0,
      expense: parseFloat(item.expense) || 0,
    }));
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('statistics.monthlyTrend')}</CardTitle>
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
        <CardTitle>{t('statistics.monthlyTrend')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('statistics.noTrendData')}
          </p>
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
                              {entry.dataKey === 'income'
                                ? t('statistics.income')
                                : t('statistics.expenses')}
                              : {formatCurrency(String(entry.value ?? 0))}
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
                <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-green-500" />
                <span>{t('statistics.income')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-red-500" />
                <span>{t('statistics.expenses')}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
