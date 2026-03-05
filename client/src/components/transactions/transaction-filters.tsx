import { X } from 'lucide-react';

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TransactionFiltersProps = {
  filters: TransactionListParams;
  onFiltersChange: (filters: TransactionListParams) => void;
  categories: CategoryResponse[];
};

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
] as const;

export function TransactionFilters({
  filters,
  onFiltersChange,
  categories,
}: TransactionFiltersProps) {
  const activeTab = filters.type ?? 'ALL';
  const hasFilters = filters.dateFrom || filters.dateTo || filters.categoryId;

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
      </Tabs>

      <div className="flex flex-col gap-1">
        <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="dateFrom"
          type="date"
          className="w-auto"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="dateTo"
          type="date"
          className="w-auto"
          value={filters.dateTo ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Select
          value={filters.categoryId ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, categoryId: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {filteredCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 gap-1">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
