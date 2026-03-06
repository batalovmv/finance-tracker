import { type ClassValue, clsx } from 'clsx';
import { type Locale, format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(parseFloat(amount));
}

export function formatMonth(month: string, dateFnsLocale?: Locale): string {
  const [year = '0', m = '1'] = month.split('-');
  // Construct from explicit integers — no TZ shift risk (matches formatDate pattern)
  const formatStr = dateFnsLocale ? 'LLL yyyy' : 'MMM yyyy';
  return format(
    new Date(parseInt(year), parseInt(m) - 1, 1),
    formatStr,
    dateFnsLocale ? { locale: dateFnsLocale } : undefined,
  );
}

/** Returns today's date as YYYY-MM-DD string (local timezone). */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(isoDate: string, dateFnsLocale?: Locale): string {
  const d = new Date(isoDate);
  // Create local Date from UTC components so format() displays the UTC date
  const dateObj = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const formatStr = dateFnsLocale ? 'd MMM yyyy' : 'MMM d, yyyy';
  return format(dateObj, formatStr, dateFnsLocale ? { locale: dateFnsLocale } : undefined);
}
