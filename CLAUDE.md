# Finance Tracker — AI Agent Instructions

> **This file is the single source of truth for all AI agents working on this project.**
> Read it fully before making any changes. Follow every rule without exception.

## 1. Project Overview

**What**: Personal finance tracker web application.
**Who**: Individual users managing income and expenses.
**Core features**:

- Multi-user authentication (JWT)
- Add/edit/delete transactions (income & expense)
- Categories with colors and icons
- Filter transactions by date, category, type
- Statistics: balance, expenses by category (charts), monthly trends
- Export transactions to CSV
- Responsive design with dark mode

## 2. Quick Start

```bash
# Prerequisites: Node 22+, pnpm 9+, Docker
docker compose up -d                          # Start PostgreSQL
cp server/.env.example server/.env            # Configure env vars
pnpm install                                  # Install dependencies
pnpm --filter server db:generate              # Generate Prisma client
pnpm --filter server db:migrate               # Run migrations
pnpm dev                                      # Start both servers
# Note: categories are seeded automatically per user on registration
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Prisma Studio: `pnpm --filter server db:studio`

## 3. Tech Stack

| Layer         | Technology                                  | Version      | Purpose                          |
| ------------- | ------------------------------------------- | ------------ | -------------------------------- |
| Frontend      | React + Vite + TypeScript                   | 19 / 6 / 5.7 | SPA framework & build            |
| UI            | shadcn/ui + Tailwind CSS + Radix UI         | v4           | Components & styling             |
| Charts        | Recharts                                    | v2           | Data visualization               |
| Data fetching | TanStack Query                              | v5           | Server state (ALL data from API) |
| Routing       | React Router                                | v7           | Client-side routing              |
| Forms         | React Hook Form + Zod                       |              | Form state & validation          |
| Client state  | Zustand                                     | v5           | Auth ONLY (user, token)          |
| Notifications | sonner                                      | v2           | Toast notifications              |
| Backend       | Node.js + Express + TypeScript              | 22 / 5 / 5.7 | REST API                         |
| ORM           | Prisma                                      | v6           | DB access & migrations           |
| Database      | PostgreSQL                                  | 16           | Data storage                     |
| Auth          | JWT + bcrypt                                |              | Access/refresh tokens            |
| Validation    | Zod                                         | v3           | Shared schemas (client + server) |
| Logging       | pino + pino-http                            |              | Structured logging + request ID  |
| Security      | helmet + express-rate-limit + cors          |              | Headers, brute-force, CORS       |
| Testing       | Vitest + RTL + Supertest + MSW + Playwright |              | Unit/integration/E2E             |
| Linting       | ESLint v9 + Prettier + import-x             |              | Code quality                     |
| Git hooks     | Husky + lint-staged                         |              | Pre-commit gates                 |

## 4. Architecture

### Data Flow

```
Client (React) → Axios → Express API → Controller → Service → Prisma → PostgreSQL
```

### Layer Responsibilities

| Layer              | Responsibility                               | Rules                                                        |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| **Controller**     | Parse request, call service, format response | NO business logic. NO Prisma. NO req/res in service calls.   |
| **Service**        | Business logic, validation, Prisma queries   | NO req/res objects. Receives plain data, returns plain data. |
| **Middleware**     | Cross-cutting concerns                       | Auth, validation, logging, error handling.                   |
| **Shared schemas** | Type definitions                             | Single source of truth for client AND server types.          |
| **Custom hooks**   | Data fetching                                | Components NEVER call useQuery directly. Always via hook.    |
| **Pages**          | Route-level components                       | Lazy-loaded. Compose from smaller components.                |
| **Components**     | UI building blocks                           | Receive data via props. No direct API calls.                 |

## 5. Coding Conventions

### TypeScript

- `strict: true` everywhere — no exceptions
- **NEVER** use `any` — use `unknown` + type narrowing
- **NEVER** use `as` assertion without a comment explaining why
- Prefer `type` over `interface` for object shapes (consistency)
- Use `type` imports: `import { type User } from '@shared/types'`

### Naming

| Thing               | Convention                    | Example                               |
| ------------------- | ----------------------------- | ------------------------------------- |
| Files               | kebab-case                    | `transaction-form.tsx`                |
| Components          | PascalCase                    | `TransactionForm`                     |
| Functions/variables | camelCase                     | `getTransactions`                     |
| Constants           | UPPER_SNAKE_CASE              | `DEFAULT_PAGE_SIZE`                   |
| Types/Interfaces    | PascalCase                    | `TransactionResponse`                 |
| Booleans            | is/has/can prefix             | `isLoading`, `hasError`, `canDelete`  |
| Event handlers      | handle prefix                 | `handleSubmit`, `handleDelete`        |
| CRUD functions      | get/list/create/update/delete | `createTransaction`, `listCategories` |

### Exports

- **Named exports** for everything
- **Default exports** ONLY for page components (for `React.lazy()`)
- **Barrel exports** (`index.ts`) only in `shared/src/`

### Money & Dates

- Money: `Decimal(12,2)` in DB → `string` in API → `formatCurrency()` on client
- Dates: `DateTime` in DB → ISO 8601 string in API → `formatDate()` on client
- All dates stored and transmitted in **UTC**

### Styling

- **Tailwind CSS only** — no inline styles, no CSS modules, no styled-components
- Use `cn()` utility for conditional classes
- Use shadcn/ui components as base — don't reinvent

## 6. API Conventions

### Success Response

```json
{ "success": true, "data": { ... } }
```

### Error Response

```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "Human-readable message", "details": {} }
}
```

### Paginated Response

```json
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }
```

### HTTP Status Codes

| Code | Usage                                  |
| ---- | -------------------------------------- |
| 200  | Success                                |
| 201  | Created                                |
| 204  | Deleted (no body)                      |
| 400  | Validation error                       |
| 401  | Unauthorized (invalid/missing token)   |
| 403  | Forbidden (valid token, wrong user)    |
| 404  | Resource not found                     |
| 409  | Conflict (duplicate, has dependencies) |
| 429  | Rate limit exceeded                    |
| 500  | Internal server error                  |

### Query Parameters

- camelCase: `dateFrom`, `dateTo`, `categoryId`
- Pagination: `page` (1-based), `limit` (default 20, max 100)
- Sorting: `sort=date:desc` or `sort=amount:asc`

## 7. Error Code Catalog

**All agents MUST use codes from this catalog. Never invent new error codes.**

```typescript
enum ErrorCode {
  // Auth
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_EXISTS = 'AUTH_EMAIL_EXISTS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // Transaction
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_FORBIDDEN = 'TRANSACTION_FORBIDDEN',

  // Category
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_FORBIDDEN = 'CATEGORY_FORBIDDEN',
  CATEGORY_DUPLICATE = 'CATEGORY_DUPLICATE',
  CATEGORY_HAS_TRANSACTIONS = 'CATEGORY_HAS_TRANSACTIONS',

  // General
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

To add a new error code: add it to `shared/src/errors.ts` AND update this section.

## 8. State Management

| What                                 | Where               | Why                                                   |
| ------------------------------------ | ------------------- | ----------------------------------------------------- |
| User & auth token                    | Zustand `authStore` | Persists across routes, not tied to API cache         |
| Transactions, categories, statistics | TanStack Query      | Server state: caching, refetching, optimistic updates |
| Form state                           | React Hook Form     | Local to form lifecycle                               |
| UI state (modals, filters)           | React `useState`    | Local to component                                    |

**RULE**: NEVER create a Zustand store for server data. If it comes from API → TanStack Query.

## 9. Import Rules

### Path Aliases

```
@/*        → src/*            (within client and server)
@shared/*  → ../shared/src/*  (cross-package)
```

### Import Order (enforced by ESLint)

```typescript
// 1. React/framework
import { useState } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Shared package
import { type Transaction } from '@shared/types';

// 4. Internal absolute (@/)
import { useTransactions } from '@/hooks/useTransactions';

// 5. Relative (./ ../)
import { columns } from './columns';
```

## 10. Commit Convention

```
feat: add transaction filtering by date range
fix: correct balance calculation for negative amounts
refactor: extract csv export to shared utility
test: add integration tests for statistics endpoints
chore: update prisma to v6.2
docs: update CLAUDE.md context map
style: fix import ordering in auth service
perf: optimize category aggregation query
```

**Rules**:

- Format: `type: lowercase description` (no period, max 72 chars)
- One logical change per commit
- Tests and code changes in the **same** commit
- Never commit broken code (all tests must pass)
- Never commit `.env`, `node_modules/`, `dist/`

## 11. Templates

### Adding a New API Endpoint

1. Define Zod schema in `shared/src/schemas/`
2. Export type from `shared/src/types/`
3. Create/update service method in `server/src/services/`
4. Create/update controller in `server/src/controllers/`
5. Register route in `server/src/routes/`
6. Write integration test in `server/__tests__/`
7. Add typed API function in `client/src/api/`
8. Create/update custom hook in `client/src/hooks/`

### Adding a New Frontend Component

1. Create in appropriate `client/src/components/` subdirectory
2. Use shadcn/ui primitives where possible
3. Define props via TypeScript `type` (not interface)
4. Write test next to component or in nearest `__tests__/`

### Adding a New Page

1. Create `PageNamePage.tsx` in `client/src/pages/` (default export)
2. Add lazy import + route in router config
3. Wrap with `<Suspense fallback={<PageSkeleton />}>`

## 12. Context Map

**Before modifying any area, READ these files first:**

### Auth

- `shared/src/schemas/auth.ts` — validation schemas
- `server/src/services/auth.service.ts` — business logic
- `server/src/middleware/authenticate.ts` — JWT verification
- `server/src/lib/jwt.ts` — token sign/verify
- `client/src/stores/auth.store.ts` — client state
- `client/src/api/auth.api.ts` — API calls
- `client/src/hooks/useAuth.ts` — React hook

### Transactions

- `shared/src/schemas/transaction.ts`
- `server/src/services/transaction.service.ts`
- `server/src/controllers/transaction.controller.ts`
- `client/src/hooks/useTransactions.ts`
- `client/src/components/transactions/` — all files

### Categories

- `shared/src/schemas/category.ts`
- `server/src/services/category.service.ts`
- `server/src/controllers/category.controller.ts`
- `client/src/hooks/useCategories.ts`

### Statistics

- `shared/src/schemas/statistics.ts`
- `client/src/hooks/useStatistics.ts`
- `client/src/components/statistics/` — all files

### Layout/Navigation

- `client/src/components/layout/` — all files
- `client/src/pages/` — routing structure
- `client/src/main.tsx` — router config

## 13. Testing Rules

- Every new API endpoint → integration test (Supertest)
- Every new service function → unit test
- Every interactive component → RTL test
- Tests MUST be independent (no shared mutable state)
- Use factories for test data (never hardcode)
- Test naming: `it('should create a transaction with valid data')`
- Coverage targets: 80% services, 90% auth, 80% hooks/utils

### Backend Test Structure

```typescript
describe('POST /api/transactions', () => {
  it('should create a transaction with valid data', async () => { ... });
  it('should return 400 for invalid amount', async () => { ... });
  it('should return 401 without auth token', async () => { ... });
  it('should return 403 for another user transaction', async () => { ... });
});
```

### Frontend Test Structure

```typescript
describe('TransactionForm', () => {
  it('should render all form fields', () => { ... });
  it('should show validation errors for empty fields', async () => { ... });
  it('should call onSubmit with form data', async () => { ... });
});
```

## 14. Security Rules

- **NEVER** store JWT in localStorage (XSS risk) — access token in memory, refresh in httpOnly cookie
- **NEVER** bypass Zod validation — every request validated in middleware
- **NEVER** access Prisma from controllers — always through service layer
- **NEVER** commit .env files — only .env.example
- All user input is validated via Zod before reaching service layer
- All DB queries use Prisma (parameterized, SQL injection safe)

## 15. Dependency Policy

Before adding a new dependency:

1. Check if existing deps solve the problem
2. Evaluate bundle size impact (client-side)
3. Check weekly downloads and maintenance status
4. Document reason in commit message: `chore: add date-fns for date formatting`
5. Update this tech stack table

## 16. Responsive Design

| Breakpoint | Width      | Tailwind | Layout                        |
| ---------- | ---------- | -------- | ----------------------------- |
| Mobile     | < 768px    | (base)   | Single column, bottom nav     |
| Tablet     | 768–1024px | `md:`    | Collapsed sidebar, 2-col grid |
| Desktop    | > 1024px   | `lg:`    | Fixed sidebar, multi-column   |

Approach: **mobile-first** — base styles for mobile, `md:` and `lg:` for larger.

## 17. Dark Mode

- Tailwind `dark:` variant
- Toggle stored in `localStorage` key `theme`
- Respects `prefers-color-scheme` on first visit
- `<html class="dark">` toggled by utility function
- shadcn/ui CSS variables provide automatic dark mode support

## 18. AI Agent Guard Rails

### BEFORE writing ANY code:

1. **SEARCH before creating** — grep for similar functions in `shared/src/`, `client/src/lib/`, `server/src/lib/`. If it exists → USE IT.
2. **READ the Context Map** (section 12) — understand which files are affected.
3. **CHECK file size** — if file exceeds limit (section 20), split first.

### BEFORE modifying `shared/` package:

1. Grep all imports of the file in `client/` and `server/`.
2. List all affected consumers.
3. Update ALL consumers in the SAME commit.
4. Never make breaking changes without updating all consumers.

### BEFORE modifying database schema:

1. Never edit existing migration files.
2. Create new migration: `pnpm --filter server db:migrate --name descriptive-name`
3. Update `seed.ts` if new required fields added.
4. Update shared Zod schemas to match.
5. Update affected services and controllers.

### AFTER adding a new feature area:

1. Update this Context Map (section 12).
2. Update Directory Guide (section 21) if new directories created.
3. Add new error codes to Error Code Catalog (section 7).
4. This file is a **LIVING document** — it MUST stay in sync with the codebase.

## 19. Frontend Error Handling

| Layer                    | Handles                  | UI                               |
| ------------------------ | ------------------------ | -------------------------------- |
| Error Boundary           | Unexpected React crashes | Fallback UI + retry button       |
| TanStack Query `onError` | API errors               | Toast via `sonner`               |
| Axios interceptor        | 401 responses            | Auto-refresh + redirect to login |
| React Hook Form + Zod    | Form validation          | Inline errors below fields       |

**Rules**:

- NEVER use `alert()`, `confirm()`, or `prompt()`
- NEVER swallow errors (no empty `catch {}`)
- API errors → toast notification (sonner)
- Form errors → inline below field
- Crashes → Error Boundary fallback

## 20. Code Size Limits

| File type       | Max lines | Action when exceeded       |
| --------------- | --------- | -------------------------- |
| React component | 150       | Extract sub-components     |
| Custom hook     | 100       | Split into smaller hooks   |
| Service file    | 200       | Split by domain concern    |
| Controller file | 150       | Extract helpers            |
| Test file       | 300       | Split by `describe` blocks |
| Zod schema file | 100       | Split by entity            |

## 21. Directory Guide

| Directory                       | When to add files                                  |
| ------------------------------- | -------------------------------------------------- |
| `shared/src/schemas/`           | New API entity or modifying request/response shape |
| `shared/src/types/`             | Types inferred from Zod schemas                    |
| `shared/src/errors.ts`          | New error code needed                              |
| `server/src/controllers/`       | New API resource (1 file per resource)             |
| `server/src/services/`          | New business logic area (1 file per resource)      |
| `server/src/middleware/`        | New cross-cutting concern                          |
| `server/src/routes/`            | New API resource routes                            |
| `server/src/lib/`               | New utility (Prisma, JWT, CSV, etc.)               |
| `client/src/api/`               | New API resource (1 file per resource)             |
| `client/src/hooks/`             | New data-fetching hook (1 per resource)            |
| `client/src/components/<area>/` | New UI component for specific area                 |
| `client/src/components/ui/`     | shadcn/ui only (auto-generated)                    |
| `client/src/pages/`             | New route/page                                     |
| `client/src/lib/`               | New client utility                                 |
| `client/src/stores/`            | Auth store ONLY. Do not add more stores.           |

## 22. Git Workflow

```
Branch naming:  feat/<short-description>
                fix/<short-description>
                refactor/<short-description>
                test/<short-description>
```

**Rules**:

- One logical change per commit
- Tests and code in same commit
- Never commit broken code
- Pre-commit hook runs lint-staged automatically
