export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  BCRYPT_ROUNDS: 12,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
  { name: 'Transportation', color: '#f97316', icon: 'car' },
  { name: 'Housing', color: '#eab308', icon: 'home' },
  { name: 'Utilities', color: '#84cc16', icon: 'zap' },
  { name: 'Healthcare', color: '#22c55e', icon: 'heart-pulse' },
  { name: 'Entertainment', color: '#06b6d4', icon: 'gamepad-2' },
  { name: 'Shopping', color: '#3b82f6', icon: 'shopping-bag' },
  { name: 'Education', color: '#6366f1', icon: 'graduation-cap' },
  { name: 'Personal Care', color: '#8b5cf6', icon: 'sparkles' },
  { name: 'Other Expenses', color: '#64748b', icon: 'circle' },
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', color: '#22c55e', icon: 'briefcase' },
  { name: 'Freelance', color: '#06b6d4', icon: 'laptop' },
  { name: 'Investments', color: '#6366f1', icon: 'trending-up' },
  { name: 'Gifts', color: '#ec4899', icon: 'gift' },
  { name: 'Other Income', color: '#64748b', icon: 'circle' },
] as const;
