import { type TransactionResponse } from '@shared/types/index.js';

const CSV_HEADERS = ['Date', 'Type', 'Category', 'Amount', 'Description'] as const;

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(transactions: TransactionResponse[]): string {
  const rows: string[] = [CSV_HEADERS.join(',')];

  for (const tx of transactions) {
    const row = [
      tx.date.split('T')[0],
      tx.type,
      escapeField(tx.category.name),
      tx.type === 'EXPENSE' ? `-${tx.amount}` : tx.amount,
      escapeField(tx.description ?? ''),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}
