import { type Control } from 'react-hook-form';

import { type CategoryResponse } from '@shared/types';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateCategory, useTranslation } from '@/i18n';

import { type TransactionFormValues } from './transaction-form-schema';

type CategorySelectFieldProps = {
  control: Control<TransactionFormValues>;
  categories: CategoryResponse[];
};

export function CategorySelectField({ control, categories }: CategorySelectFieldProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('form.category')}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectCategory')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {t('form.noCategories')}
                </div>
              ) : (
                categories.map((cat) => (
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
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
