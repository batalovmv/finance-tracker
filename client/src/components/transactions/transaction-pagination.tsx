import { ChevronLeft, ChevronRight } from 'lucide-react';

import { type PaginationMeta } from '@shared/types';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';

type TransactionPaginationProps = {
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
};

export function TransactionPagination({ meta, page, onPageChange }: TransactionPaginationProps) {
  const { t } = useTranslation();

  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t('pagination.info', { page, totalPages: meta.totalPages, total: meta.total })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />
          {t('pagination.prev')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('pagination.next')}
          <ChevronRight aria-hidden="true" className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
