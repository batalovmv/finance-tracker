import { type Locale } from 'date-fns';
import { ru } from 'date-fns/locale';

import { formatCurrency, formatDate, formatMonth } from '@/lib/utils';
import { type Currency, usePreferencesStore } from '@/stores/preferences.store';

const CURRENCY_LOCALE: Record<Currency, string> = {
  RUB: 'ru-RU',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function useFormatters() {
  const language = usePreferencesStore((s) => s.language);
  const currency = usePreferencesStore((s) => s.currency);

  const dateFnsLocale: Locale | undefined = language === 'ru' ? ru : undefined;
  const numberLocale = CURRENCY_LOCALE[currency];

  return {
    formatCurrency: (amount: string) => formatCurrency(amount, currency, numberLocale),
    formatDate: (isoDate: string) => formatDate(isoDate, dateFnsLocale),
    formatMonth: (monthStr: string) => formatMonth(monthStr, dateFnsLocale),
  };
}
