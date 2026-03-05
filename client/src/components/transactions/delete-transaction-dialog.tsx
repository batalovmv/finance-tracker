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
import { useDeleteTransaction } from '@/hooks/use-transactions';
import { formatCurrency, formatDate } from '@/lib/utils';

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
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transaction?
            {transaction && (
              <>
                {' '}
                <strong>
                  {formatCurrency(transaction.amount)} on {formatDate(transaction.date)}
                </strong>
                . This action cannot be undone.
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
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
