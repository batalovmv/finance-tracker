import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(amount));
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  // Create local Date from UTC components so format() displays the UTC date
  return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), 'MMM d, yyyy');
}
