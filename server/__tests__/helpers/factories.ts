import {
  type RegisterInput,
  type LoginInput,
  type CreateTransactionInput,
  type CreateCategoryInput,
} from '@shared/types/index.js';

let counter = 0;

function uniqueEmail(): string {
  counter += 1;
  return `test-${counter}-${Date.now()}@example.com`;
}

export function buildRegisterInput(overrides: Partial<RegisterInput> = {}): RegisterInput {
  return {
    email: uniqueEmail(),
    password: 'TestPassword123!',
    name: 'Test User',
    ...overrides,
  };
}

export function buildLoginInput(overrides: Partial<LoginInput> = {}): LoginInput {
  return {
    email: 'test@example.com',
    password: 'TestPassword123!',
    ...overrides,
  };
}

export function buildCreateCategoryInput(
  overrides: Partial<CreateCategoryInput> = {},
): CreateCategoryInput {
  return {
    name: `Category ${Date.now()}-${++counter}`,
    type: 'EXPENSE',
    color: '#ef4444',
    icon: 'circle',
    ...overrides,
  };
}

export function buildCreateTransactionInput(
  overrides: Partial<CreateTransactionInput> & { categoryId: string },
): CreateTransactionInput {
  return {
    amount: '100.00',
    type: 'EXPENSE',
    date: new Date(),
    description: 'Test transaction',
    ...overrides,
  };
}
