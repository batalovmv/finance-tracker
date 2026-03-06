import {
  type ApiSuccessResponse,
  type CategoryResponse,
  type TransactionType,
} from '@shared/types';

import { api } from '@/lib/axios';

export function listCategories(type?: TransactionType) {
  return api.get<ApiSuccessResponse<CategoryResponse[]>>('/categories', {
    params: type ? { type } : undefined,
  });
}
