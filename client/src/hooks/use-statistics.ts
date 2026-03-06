import { useQuery } from '@tanstack/react-query';

import {
  type ByCategoryParams,
  type SummaryParams,
  getByCategory,
  getMonthlyTrend,
  getSummary,
} from '@/api/statistics.api';

export const statisticsKeys = {
  all: ['statistics'] as const,
  summary: (params?: SummaryParams) => ['statistics', 'summary', params] as const,
  byCategory: (params?: ByCategoryParams) => ['statistics', 'by-category', params] as const,
  monthlyTrend: (months?: number) => ['statistics', 'monthly-trend', months] as const,
};

export function useSummary(params?: SummaryParams) {
  return useQuery({
    queryKey: statisticsKeys.summary(params),
    queryFn: async () => {
      const res = await getSummary(params);
      return res.data.data;
    },
  });
}

export function useByCategory(params?: ByCategoryParams) {
  return useQuery({
    queryKey: statisticsKeys.byCategory(params),
    queryFn: async () => {
      const res = await getByCategory(params);
      return res.data.data;
    },
  });
}

export function useMonthlyTrend(months?: number) {
  return useQuery({
    queryKey: statisticsKeys.monthlyTrend(months),
    queryFn: async () => {
      const res = await getMonthlyTrend(months);
      return res.data.data;
    },
  });
}
