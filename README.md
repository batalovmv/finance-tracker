# Finance Tracker

Personal finance tracker web application with multi-user support, transaction management, category-based statistics, and CSV export.

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker (for PostgreSQL)

## Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp server/.env.example server/.env

# 4. Setup database
pnpm --filter server db:generate
pnpm --filter server db:migrate
pnpm --filter server db:seed

# 5. Start development
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Prisma Studio: `pnpm --filter server db:studio`

## Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `pnpm dev`         | Start frontend + backend |
| `pnpm build`       | Build all packages       |
| `pnpm test`        | Run all tests            |
| `pnpm test:server` | Run backend tests        |
| `pnpm test:client` | Run frontend tests       |
| `pnpm test:e2e`    | Run E2E tests            |
| `pnpm lint`        | Lint all files           |
| `pnpm format`      | Format all files         |

## Project Structure

```
├── shared/     # Shared Zod schemas, types, constants
├── client/     # React SPA (Vite + Tailwind + shadcn/ui)
├── server/     # Express API (Prisma + PostgreSQL)
└── e2e/        # Playwright E2E tests
```

See [CLAUDE.md](./CLAUDE.md) for full architecture documentation.
