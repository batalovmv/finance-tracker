import { z } from 'zod';

export const transactionFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
    .refine((val) => parseFloat(val) > 0, 'Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Type is required' }),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
