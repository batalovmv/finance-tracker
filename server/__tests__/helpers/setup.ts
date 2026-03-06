import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';

const testDatabaseUrl =
  process.env.DATABASE_URL_TEST ??
  'postgresql://finance:finance_dev@localhost:5433/finance_tracker_test';

// Override DATABASE_URL for the test process
process.env.DATABASE_URL = testDatabaseUrl;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-for-testing';
process.env.LOG_LEVEL = 'silent';

const prisma = new PrismaClient({
  datasources: {
    db: { url: testDatabaseUrl },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  // Truncate all tables in correct order (respecting foreign keys)
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
