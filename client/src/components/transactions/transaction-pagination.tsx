import { ChevronLeft, ChevronRight } from 'lucide-react';

import { type PaginationMeta } from '@shared/types';

import { Button } from '@/components/ui/button';

type TransactionPaginationProps = {
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
};

export function TransactionPagination({ meta, page, onPageChange }: TransactionPaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {meta.totalPages} ({meta.total} total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
