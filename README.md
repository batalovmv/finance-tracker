# Finance Tracker

Веб-приложение для учёта личных финансов. Позволяет вести доходы и расходы, группировать их по категориям, просматривать статистику и экспортировать данные.

**Демо**: [finance-tracker-client-zeta.vercel.app](https://finance-tracker-client-zeta.vercel.app)

## Возможности

- Регистрация и авторизация (JWT — access + refresh tokens)
- CRUD транзакций с фильтрацией по дате, категории и типу
- Категории транзакций (предустановленный набор для доходов и расходов)
- Дашборд: баланс, последние транзакции, график расходов
- Статистика: расходы/доходы по категориям (pie chart), месячные тренды (bar chart)
- Экспорт транзакций в CSV
- Тёмная тема
- Адаптивный дизайн (мобильные, планшеты, десктоп)
- Локализация (EN/RU)

## Архитектура

```
Browser → Vercel (React SPA) → Render (Express API) → Neon (PostgreSQL)
```

Монорепозиторий (pnpm workspaces) из трёх пакетов:

| Пакет    | Назначение                  |
| -------- | --------------------------- |
| `shared` | Zod-схемы, типы и константы |
| `client` | React SPA                   |
| `server` | REST API                    |

## Стек технологий

**Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Radix UI, Recharts, TanStack Query, React Router v7, React Hook Form, Zustand

**Backend**: Node.js 22, Express 5, TypeScript, Prisma ORM, PostgreSQL, JWT (access + refresh), pino, helmet, express-rate-limit

**Общее**: Zod (валидация на клиенте и сервере через shared-пакет)

**Тестирование**: Vitest, React Testing Library, MSW, Supertest, Playwright

**Инфраструктура**: ESLint v9, Prettier, Husky + lint-staged

## Деплой

| Компонент   | Сервис                       |
| ----------- | ---------------------------- |
| Frontend    | Vercel                       |
| Backend     | Render                       |
| База данных | Neon (serverless PostgreSQL) |
