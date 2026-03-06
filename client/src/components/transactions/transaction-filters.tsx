import { Calendar, X } from 'lucide-react';

import { type CategoryResponse, type TransactionType } from '@shared/types';

import { type TransactionListParams } from '@/api/transactions.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translateCategory, useTranslation } from '@/i18n';
import { getTodayString } from '@/lib/utils';

type TransactionFiltersProps = {
  filters: TransactionListParams;
  onFiltersChange: (filters: TransactionListParams) => void;
  categories: CategoryResponse[];
};

export function TransactionFilters({
  filters,
  onFiltersChange,
  categories,
}: TransactionFiltersProps) {
  const { t } = useTranslation();

  const TYPE_OPTIONS = [
    { value: 'ALL', label: t('filter.all') },
    { value: 'INCOME', label: t('filter.income') },
    { value: 'EXPENSE', label: t('filter.expense') },
  ] as const;
  const activeTab = filters.type ?? 'ALL';
  const today = getTodayString();
  const hasFilters = !!(filters.dateFrom || filters.dateTo || filters.categoryId);

  const filteredCategories = filters.type
    ? categories.filter((c) => c.type === filters.type)
    : categories;

  function handleTypeChange(value: string) {
    // value is constrained by TYPE_OPTIONS: 'ALL' | 'INCOME' | 'EXPENSE'
    const type = value === 'ALL' ? undefined : (value as TransactionType);
    onFiltersChange({ ...filters, type, categoryId: undefined });
  }

  function handleClearFilters() {
    onFiltersChange({});
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
      <Tabs value={activeTab} onValueChange={handleTypeChange}>
        <TabsList>
          {TYPE_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value}>
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Hidden panels satisfy aria-controls on each TabsTrigger */}
        {TYPE_OPTIONS.map((opt) => (
          <TabsContent key={opt.value} value={opt.value} className="sr-only" />
        ))}
      </Tabs>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
            {t('filter.dateFrom')}
          </Label>
          <div className="relative">
            <Input
              id="dateFrom"
              type="date"
              className="w-full pr-9 sm:w-auto"
              max={filters.dateTo ?? today}
              value={filters.dateFrom ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })
              }
            />
            <Calendar
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
            {t('filter.dateTo')}
          </Label>
          <div className="relative">
            <Input
              id="dateTo"
              type="date"
              className="w-full pr-9 sm:w-auto"
              max={today}
              min={filters.dateFrom}
              value={filters.dateTo ?? ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
            />
            <Calendar
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{t('filter.category')}</Label>
        <Select
          value={filters.categoryId ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, categoryId: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('filter.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.allCategories')}</SelectItem>
            {filteredCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {translateCategory(cat.name, t)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 gap-1">
          <X aria-hidden="true" className="h-4 w-4" />
          {t('filter.reset')}
        </Button>
      )}
    </div>
  );
}
