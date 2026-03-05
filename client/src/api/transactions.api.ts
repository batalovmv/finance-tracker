import {
  type ApiPaginatedResponse,
  type ApiSuccessResponse,
  type CreateTransactionInput,
  type TransactionResponse,
  type TransactionType,
  type UpdateTransactionInput,
} from '@shared/types';

import { api } from '@/lib/axios';

export type TransactionListParams = Partial<{
  type: TransactionType;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
  sort: string;
  page: number;
  limit: number;
}>;

export function listTransactions(params: TransactionListParams) {
  return api.get<ApiPaginatedResponse<TransactionResponse>>('/transactions', { params });
}

export function createTransaction(data: CreateTransactionInput) {
  return api.post<ApiSuccessResponse<TransactionResponse>>('/transactions', data);
}

export function updateTransaction(id: string, data: UpdateTransactionInput) {
  return api.put<ApiSuccessResponse<TransactionResponse>>(`/transactions/${id}`, data);
}

export function deleteTransaction(id: string) {
  return api.delete(`/transactions/${id}`);
}

export function exportTransactionsCsv(params: Omit<TransactionListParams, 'page' | 'limit'>) {
  return api.get('/transactions/export', { params, responseType: 'blob' });
}
