import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { type TransactionListParams, exportTransactionsCsv } from '@/api/transactions.api';

export function useExportTransactions() {
  return useMutation({
    mutationFn: (params: Omit<TransactionListParams, 'page' | 'limit'>) =>
      exportTransactionsCsv(params),
    onSuccess: ({ data }) => {
      // responseType: 'blob' guarantees data is a Blob
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      // Defer revocation so the browser can initiate the download
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success('Transactions exported');
    },
    onError: () => {
      toast.error('Failed to export transactions');
    },
  });
}
