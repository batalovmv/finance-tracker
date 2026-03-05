import { type ApiSuccessResponse, type CategoryResponse } from '@shared/types';

import { api } from '@/lib/axios';

export function listCategories(type?: 'INCOME' | 'EXPENSE') {
  return api.get<ApiSuccessResponse<CategoryResponse[]>>('/categories', {
    params: type ? { type } : undefined,
  });
}
