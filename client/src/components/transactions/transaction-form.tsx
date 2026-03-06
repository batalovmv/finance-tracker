import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { type CategoryResponse } from '@shared/types';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/i18n';
import { getTodayString } from '@/lib/utils';

import { CategorySelectField } from './category-select-field';
import { type TransactionFormValues, createTransactionFormSchema } from './transaction-form-schema';

type TransactionFormProps = {
  mode: 'create' | 'edit';
  defaultValues: TransactionFormValues;
  categories: CategoryResponse[];
  isPending: boolean;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
};

export function TransactionForm({
  mode,
  defaultValues,
  categories,
  isPending,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { t } = useTranslation();
  const schema = createTransactionFormSchema(t);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: defaultValues,
  });

  const watchedType = form.watch('type');
  const filteredCategories = categories.filter((c) => c.type === watchedType);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.type')}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue('categoryId', '');
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EXPENSE">{t('form.expense')}</SelectItem>
                    <SelectItem value="INCOME">{t('form.income')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.amount')}</FormLabel>
                <FormControl>
                  <Input placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <CategorySelectField control={form.control} categories={filteredCategories} />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.date')}</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input type="date" max={getTodayString()} className="pr-9" {...field} />
                </FormControl>
                <Calendar
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description')}</FormLabel>
              <FormControl>
                <Input placeholder="например, Зарплата" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t('form.saving')
              : mode === 'create'
                ? t('form.addTransaction')
                : t('form.save')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
