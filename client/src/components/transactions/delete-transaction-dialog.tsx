import { type TransactionResponse } from '@shared/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFormatters } from '@/hooks/use-formatters';
import { useDeleteTransaction } from '@/hooks/use-transactions';
import { useTranslation } from '@/i18n';

type DeleteTransactionDialogProps = {
  open: boolean;
  transaction: TransactionResponse | null;
  onClose: () => void;
};

export function DeleteTransactionDialog({
  open,
  transaction,
  onClose,
}: DeleteTransactionDialogProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();
  const deleteMutation = useDeleteTransaction(onClose);

  function handleDelete() {
    if (transaction) {
      deleteMutation.mutate(transaction.id);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.confirm')}
            {transaction && (
              <>
                {' '}
                <strong>
                  {t('delete.details', {
                    amount: formatCurrency(transaction.amount),
                    date: formatDate(transaction.date),
                  })}
                </strong>
                . {t('delete.irreversible')}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t('delete.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? t('delete.deleting') : t('delete.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
