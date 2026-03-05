import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { type CreateTransactionInput, type UpdateTransactionInput } from '@shared/types';

import {
  type TransactionListParams,
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from '@/api/transactions.api';

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => ['transactions', 'list'] as const,
  list: (params: TransactionListParams) => ['transactions', 'list', params] as const,
};

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: async () => {
      const res = await listTransactions(params);
      return res.data;
    },
  });
}

export function useCreateTransaction(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) => createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Transaction created');
      onSuccess?.();
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ?? 'Failed to create transaction')
        : 'Failed to create transaction';
      toast.error(message);
    },
  });
}

export function useUpdateTransaction(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Transaction updated');
      onSuccess?.();
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ?? 'Failed to update transaction')
        : 'Failed to update transaction';
      toast.error(message);
    },
  });
}

export function useDeleteTransaction(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Transaction deleted');
      onSuccess?.();
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ?? 'Failed to delete transaction')
        : 'Failed to delete transaction';
      toast.error(message);
    },
  });
}
