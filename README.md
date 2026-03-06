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

## Deployment

The application is deployed using a free-tier stack:

| Component | Service | URL                                            |
| --------- | ------- | ---------------------------------------------- |
| Frontend  | Vercel  | https://finance-tracker-client-zeta.vercel.app |
| Backend   | Render  | https://finance-tracker-vvlm.onrender.com      |
| Database  | Neon    | PostgreSQL (serverless)                        |

### Architecture

```
Browser → Vercel (React SPA) → Render (Express API) → Neon (PostgreSQL)
```

Frontend and backend are on different domains, which required several cross-origin configurations (see Deployment Challenges below).

### Render (Backend) Configuration

- **Root Directory**: `server`
- **Build Command**: `cd .. && pnpm install --prod=false && pnpm --filter shared build && pnpm --filter server build && cd server && npx prisma migrate deploy`
- **Start Command**: `npx tsx src/server.ts`
- **Environment Variables**: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `NODE_ENV`, `PORT`

### Vercel (Frontend) Configuration

- **Root Directory**: `client`
- **Build Command**: `cd .. && pnpm install && pnpm --filter shared build && pnpm --filter client build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_URL` (points to Render backend URL)

### Free Tier Limitations

- **Render**: server sleeps after 15 min of inactivity, cold start ~30-50 sec
- **Neon**: database sleeps after 5 min, first query slightly slower
- **Vercel**: 100 GB bandwidth/month (sufficient for personal use)

### Deployment Challenges

During deployment, several issues were encountered and resolved:

1. **`husky: not found` in production** — Render sets `NODE_ENV=production`, skipping devDependencies. The `prepare` script (`husky`) failed. Fixed by changing to `"prepare": "husky || true"`.

2. **Test files included in `tsc` build** — TypeScript compiled test files that referenced vitest globals (`it`, `expect`), causing build errors. Fixed by adding `exclude` for test patterns in `client/tsconfig.json` and creating `vite-env.d.ts` for `import.meta.env` types.

3. **Express 5 type errors with newer `@types/express`** — Render resolved newer type versions where `req.params` values are `string | string[] | undefined` and router types require `@types/express-serve-static-core` references. Fixed by setting `declaration: false` in server tsconfig and adding type assertions for `req.params.id`.

4. **`tsc` doesn't transform path aliases** — Compiled JS retained `@shared/*` and `@/*` imports that Node.js cannot resolve. Fixed by using `tsx` (TypeScript runtime) instead of compiled `node dist/server.js` for production, which resolves tsconfig paths at runtime.

5. **`tsx` binary not found on Render** — The `tsx` binary was in root `node_modules/.bin/`, but Render's start command runs from the `server/` directory. Fixed by using `npx tsx` which traverses up to find the binary.

6. **SPA routing 404 on Vercel** — Direct navigation to `/login` or `/register` returned 404 because Vercel looked for physical files. Fixed by adding `vercel.json` with a catch-all rewrite to `index.html`.

7. **Wrong environment variable name for CORS** — The server uses `CLIENT_URL` (not `CORS_ORIGIN`) to configure allowed origins. The mismatch caused CORS to default to `http://localhost:5173`.

8. **Cross-origin cookies blocked** — Refresh tokens are stored in httpOnly cookies. With frontend and backend on different domains, `SameSite=strict` prevented cookies from being sent. Fixed by using `SameSite=none; Secure=true` in production (required for cross-origin cookie sharing).
