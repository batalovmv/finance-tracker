import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { type TranslationKey, useTranslation } from '@/i18n';

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
    placeholderData: keepPreviousData,
  });
}

export function useCreateTransaction(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) => createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(t('toast.transactionCreated'));
      onSuccess?.();
    },
    onError: (error) => {
      const code = axios.isAxiosError(error) ? error.response?.data?.error?.code : null;
      toast.error(code ? t(`error.${code}` as TranslationKey) : t('toast.createError'));
    },
  });
}

export function useUpdateTransaction(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(t('toast.transactionUpdated'));
      onSuccess?.();
    },
    onError: (error) => {
      const code = axios.isAxiosError(error) ? error.response?.data?.error?.code : null;
      toast.error(code ? t(`error.${code}` as TranslationKey) : t('toast.updateError'));
    },
  });
}

export function useDeleteTransaction(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(t('toast.transactionDeleted'));
      onSuccess?.();
    },
    onError: (error) => {
      const code = axios.isAxiosError(error) ? error.response?.data?.error?.code : null;
      toast.error(code ? t(`error.${code}` as TranslationKey) : t('toast.deleteError'));
    },
  });
}
