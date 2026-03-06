import { useEffect, useState } from 'react';

import { Download, Plus } from 'lucide-react';

import { type TransactionResponse } from '@shared/types';

import { type TransactionListParams } from '@/api/transactions.api';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';
import { TransactionDialog } from '@/components/transactions/transaction-dialog';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/use-categories';
import { useExportTransactions } from '@/hooks/use-export-transactions';
import { useTransactions } from '@/hooks/use-transactions';
import { useTranslation } from '@/i18n';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; transaction: TransactionResponse }
  | { mode: 'delete'; transaction: TransactionResponse };

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TransactionListParams>({});
  const [page, setPage] = useState(1);
  const [dialogState, setDialogState] = useState<DialogState>({ mode: 'closed' });

  const { data, isLoading, isError } = useTransactions({ ...filters, page, sort: 'date:desc' });
  const { data: categories = [] } = useCategories();
  const exportMutation = useExportTransactions();

  // Auto-adjust page when it exceeds totalPages (e.g. after deleting last item on last page)
  useEffect(() => {
    if (data && data.meta.totalPages > 0 && page > data.meta.totalPages) {
      setPage(data.meta.totalPages);
    }
  }, [data, page]);

  function handleFiltersChange(newFilters: TransactionListParams) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleCloseDialog() {
    setDialogState({ mode: 'closed' });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate(filters)}
            disabled={exportMutation.isPending}
          >
            <Download aria-hidden="true" className="mr-2 h-4 w-4" />
            {t('transactions.export')}
          </Button>
          <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            {t('transactions.add')}
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{t('transactions.loadError')}</AlertDescription>
        </Alert>
      )}

      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={categories}
      />

      <TransactionTable
        transactions={data?.data ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        onEdit={(t) => setDialogState({ mode: 'edit', transaction: t })}
        onDelete={(t) => setDialogState({ mode: 'delete', transaction: t })}
      />

      <TransactionDialog
        open={dialogState.mode === 'create' || dialogState.mode === 'edit'}
        mode={dialogState.mode === 'edit' ? 'edit' : 'create'}
        transaction={dialogState.mode === 'edit' ? dialogState.transaction : null}
        categories={categories}
        onClose={handleCloseDialog}
      />

      <DeleteTransactionDialog
        open={dialogState.mode === 'delete'}
        transaction={dialogState.mode === 'delete' ? dialogState.transaction : null}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
