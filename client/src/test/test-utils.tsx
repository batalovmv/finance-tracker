import { type ReactElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, type MemoryRouterProps } from 'react-router';

type RenderWithProvidersOptions = RenderOptions & {
  routerProps?: MemoryRouterProps;
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement, options?: RenderWithProvidersOptions) {
  const { routerProps, ...renderOptions } = options ?? {};
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();

  return {
    user,
    ...render(ui, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
      ...renderOptions,
    }),
  };
}

export { screen, waitFor, within } from '@testing-library/react';
