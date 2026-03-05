import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.warn(
    'Seed: No standalone seed needed — categories are created per user on registration.',
  );
  console.warn('See server/src/lib/seed-categories.ts for the seeding logic.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
