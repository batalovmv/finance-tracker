import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { type PaginationMeta, type TransactionResponse } from '@shared/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFormatters } from '@/hooks/use-formatters';
import { translateCategory, useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

import { TransactionPagination } from './transaction-pagination';

type TransactionTableProps = {
  transactions: TransactionResponse[];
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (transaction: TransactionResponse) => void;
};

export function TransactionTable({
  transactions,
  meta,
  page,
  onPageChange,
  isLoading,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table aria-label="Transactions">
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.date')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('table.description')}</TableHead>
              <TableHead>{t('table.category')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('table.type')}</TableHead>
              <TableHead className="text-right">{t('table.amount')}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-lg font-medium">{t('transactions.empty')}</p>
        <p className="text-sm text-muted-foreground">{t('transactions.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table aria-label="Transactions">
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.date')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('table.description')}</TableHead>
              <TableHead>{t('table.category')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('table.type')}</TableHead>
              <TableHead className="text-right">{t('table.amount')}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                  {tx.description || <span className="text-muted-foreground">&mdash;</span>}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: tx.category.color }}
                    />
                    <span className="truncate max-w-[80px] sm:max-w-none">
                      {translateCategory(tx.category.name, t)}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={cn(
                      tx.type === 'INCOME'
                        ? 'border-green-500/50 text-green-600 dark:text-green-400'
                        : 'border-red-500/50 text-red-600 dark:text-red-400',
                    )}
                  >
                    {tx.type === 'INCOME' ? t('table.income') : t('table.expense')}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium whitespace-nowrap text-xs sm:text-sm',
                    tx.type === 'INCOME'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('table.actions')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tx)}>
                        <Pencil aria-hidden="true" className="mr-2 h-4 w-4" />
                        {t('table.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(tx)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
                        {t('table.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionPagination meta={meta} page={page} onPageChange={onPageChange} />
    </div>
  );
}
