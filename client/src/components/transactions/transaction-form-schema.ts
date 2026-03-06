import { z } from 'zod';

import { type TFunction } from '@/i18n';

export function createTransactionFormSchema(t: TFunction) {
  return z.object({
    amount: z
      .string()
      .min(1, t('validation.amountRequired'))
      .regex(/^\d+(\.\d{1,2})?$/, t('validation.amountInvalid'))
      .refine((val) => parseFloat(val) > 0, t('validation.amountPositive')),
    type: z.enum(['INCOME', 'EXPENSE'], { required_error: t('validation.typeRequired') }),
    categoryId: z.string().min(1, t('validation.categoryRequired')),
    date: z
      .string()
      .min(1, t('validation.dateRequired'))
      .regex(/^\d{4}-\d{2}-\d{2}$/, t('validation.dateInvalid')),
    description: z.string().max(500).optional(),
  });
}

export type TransactionFormValues = z.infer<ReturnType<typeof createTransactionFormSchema>>;
