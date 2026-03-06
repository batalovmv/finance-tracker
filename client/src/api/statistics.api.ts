import {
  type ApiSuccessResponse,
  type ByCategoryItem,
  type MonthlyTrendItem,
  type SummaryResponse,
  type TransactionType,
} from '@shared/types';

import { api } from '@/lib/axios';

export type SummaryParams = Partial<{
  dateFrom: string;
  dateTo: string;
}>;

export type ByCategoryParams = Partial<{
  dateFrom: string;
  dateTo: string;
  type: TransactionType;
}>;

export function getSummary(params?: SummaryParams) {
  return api.get<ApiSuccessResponse<SummaryResponse>>('/statistics/summary', { params });
}

export function getByCategory(params?: ByCategoryParams) {
  return api.get<ApiSuccessResponse<ByCategoryItem[]>>('/statistics/by-category', { params });
}

export function getMonthlyTrend(months?: number) {
  return api.get<ApiSuccessResponse<MonthlyTrendItem[]>>('/statistics/monthly-trend', {
    params: months !== undefined ? { months } : undefined,
  });
}
