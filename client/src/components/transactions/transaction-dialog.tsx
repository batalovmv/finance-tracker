import { useMemo } from 'react';

import { type CategoryResponse, type TransactionResponse } from '@shared/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useTranslation } from '@/i18n';

import { TransactionForm } from './transaction-form';
import { type TransactionFormValues } from './transaction-form-schema';

type TransactionDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  transaction: TransactionResponse | null;
  categories: CategoryResponse[];
  onClose: () => void;
};

const CREATE_DEFAULTS: TransactionFormValues = {
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  date: '',
  description: '',
};

export function TransactionDialog({
  open,
  mode,
  transaction,
  categories,
  onClose,
}: TransactionDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateTransaction(onClose);
  const updateMutation = useUpdateTransaction(onClose);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const defaultValues = useMemo<TransactionFormValues>(() => {
    if (mode === 'edit' && transaction) {
      return {
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: transaction.date.slice(0, 10),
        description: transaction.description ?? '',
      };
    }
    return { ...CREATE_DEFAULTS, date: new Date().toISOString().slice(0, 10) };
  }, [mode, transaction]);

  function handleSubmit(values: TransactionFormValues) {
    const date = new Date(values.date + 'T00:00:00.000Z');

    if (mode === 'edit' && transaction) {
      updateMutation.mutate({
        id: transaction.id,
        data: {
          ...values,
          date,
          description: values.description || null, // null signals "clear" to server
        },
      });
    } else {
      createMutation.mutate({
        ...values,
        date,
        description: values.description || undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('dialog.createTitle') : t('dialog.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? t('dialog.createDescription') : t('dialog.editDescription')}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TransactionForm
            mode={mode}
            defaultValues={defaultValues}
            categories={categories}
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
