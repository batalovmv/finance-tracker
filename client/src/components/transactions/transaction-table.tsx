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
import { cn, formatCurrency, formatDate } from '@/lib/utils';

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
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-lg font-medium">No transactions found</p>
        <p className="text-sm text-muted-foreground">
          Add your first transaction or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap">{formatDate(t.date)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {t.description || <span className="text-muted-foreground">&mdash;</span>}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.category.color }}
                  />
                  <span className="truncate">{t.category.name}</span>
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    t.type === 'INCOME'
                      ? 'border-green-500/50 text-green-600 dark:text-green-400'
                      : 'border-red-500/50 text-red-600 dark:text-red-400',
                  )}
                >
                  {t.type === 'INCOME' ? 'Income' : 'Expense'}
                </Badge>
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium whitespace-nowrap',
                  t.type === 'INCOME'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {t.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(t.amount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(t)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(t)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TransactionPagination meta={meta} page={page} onPageChange={onPageChange} />
    </div>
  );
}
