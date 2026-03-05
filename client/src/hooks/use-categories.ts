import { useQuery } from '@tanstack/react-query';

import { type TransactionType } from '@shared/types';

import * as categoriesApi from '@/api/categories.api';

export const categoryKeys = {
  all: ['categories'] as const,
  byType: (type?: TransactionType) => ['categories', type ?? 'ALL'] as const,
};

export function useCategories(type?: TransactionType) {
  return useQuery({
    queryKey: categoryKeys.byType(type),
    queryFn: async () => {
      const res = await categoriesApi.listCategories(type);
      return res.data.data;
    },
    staleTime: Infinity,
  });
}
