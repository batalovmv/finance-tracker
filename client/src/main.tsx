import { lazy, StrictMode, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';

import { ErrorBoundary } from '@/components/error-boundary';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { Skeleton } from '@/components/ui/skeleton';
import { queryClient } from '@/lib/query-client';
import { initTheme } from '@/lib/theme';

import './index.css';

const LoginPage = lazy(() => import('@/pages/login-page'));
const RegisterPage = lazy(() => import('@/pages/register-page'));
const DashboardPage = lazy(() => import('@/pages/dashboard-page'));
const TransactionsPage = lazy(() => import('@/pages/transactions-page'));
const StatisticsPage = lazy(() => import('@/pages/statistics-page'));

initTheme();

function PageSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <RegisterPage />
                </Suspense>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="transactions"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <TransactionsPage />
                  </Suspense>
                }
              />
              <Route
                path="statistics"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <StatisticsPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
);
