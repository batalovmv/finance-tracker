import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';

import { mockTransactions } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

import TransactionsPage from '../transactions-page';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderTransactionsPage() {
  return renderWithProviders(<TransactionsPage />);
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('should show loading skeletons while fetching', () => {
    renderTransactionsPage();

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render transaction list with data', async () => {
    renderTransactionsPage();

    expect(await screen.findByText('Monthly salary')).toBeInTheDocument();
    expect(await screen.findByText('Lunch with team')).toBeInTheDocument();
    expect(screen.getByText('Зарплата')).toBeInTheDocument();
    expect(screen.getByText('Еда и напитки')).toBeInTheDocument();
  });

  it('should show empty state when no transactions', async () => {
    server.use(
      http.get('*/api/transactions', () => {
        return HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
      }),
    );

    renderTransactionsPage();

    expect(await screen.findByText('Транзакции не найдены')).toBeInTheDocument();
  });

  it('should filter by type when Income tab is clicked', async () => {
    const { user } = renderTransactionsPage();

    // Wait for initial data
    expect(await screen.findByText('Monthly salary')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /доходы/i }));

    // After clicking Income tab, the handler filters by type
    await waitFor(() => {
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
      expect(screen.queryByText('Lunch with team')).not.toBeInTheDocument();
    });
  });

  it('should open create dialog when Add Transaction is clicked', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    await user.click(screen.getByRole('button', { name: /добавить транзакцию/i }));

    expect(
      await screen.findByRole('heading', { name: /добавить транзакцию/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/сумма/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/дата/i)).toBeInTheDocument();
  });

  it('should create a transaction and show success toast', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open create dialog
    await user.click(screen.getByRole('button', { name: /добавить транзакцию/i }));
    await screen.findByRole('heading', { name: /добавить транзакцию/i });

    // Fill form
    await user.type(screen.getByLabelText(/сумма/i), '100.00');

    // Select category — need to open the category select
    const categoryTrigger = screen.getByRole('combobox', { name: /категория/i });
    await user.click(categoryTrigger);

    // Find and click the first expense category
    const categoryOption = await screen.findByRole('option', { name: /еда и напитки/i });
    await user.click(categoryOption);

    // Submit
    await user.click(screen.getByRole('button', { name: /добавить транзакцию$/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Транзакция создана');
    });
  });

  it('should open edit dialog with pre-filled data', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Click the actions menu for the first transaction
    const actionButtons = screen.getAllByRole('button', { name: /действия/i });
    await user.click(actionButtons[0]);

    // Click Edit
    const editOption = await screen.findByRole('menuitem', { name: /редактировать/i });
    await user.click(editOption);

    // Verify pre-filled data
    expect(
      await screen.findByRole('heading', { name: /редактировать транзакцию/i }),
    ).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/сумма/i);
    expect(amountInput).toHaveValue(mockTransactions[0].amount);
  });

  it('should update a transaction and show success toast', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open edit dialog via actions menu
    const actionButtons = screen.getAllByRole('button', { name: /действия/i });
    await user.click(actionButtons[0]);
    const editOption = await screen.findByRole('menuitem', { name: /редактировать/i });
    await user.click(editOption);

    await screen.findByRole('heading', { name: /редактировать транзакцию/i });

    // Change amount
    const amountInput = screen.getByLabelText(/сумма/i);
    await user.clear(amountInput);
    await user.type(amountInput, '2000.00');

    await user.click(screen.getByRole('button', { name: /сохранить/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Транзакция обновлена');
    });
  });

  it('should open delete dialog and confirm deletion', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Click the actions menu
    const actionButtons = screen.getAllByRole('button', { name: /действия/i });
    await user.click(actionButtons[0]);

    // Click Delete
    const deleteOption = await screen.findByRole('menuitem', { name: /удалить/i });
    await user.click(deleteOption);

    // Verify confirmation dialog
    expect(await screen.findByRole('heading', { name: /удалить транзакцию/i })).toBeInTheDocument();

    // Confirm delete
    await user.click(screen.getByRole('button', { name: /^удалить$/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Транзакция удалена');
    });
  });

  it('should show error toast when create fails', async () => {
    server.use(
      http.post('*/api/transactions', () => {
        return HttpResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid amount' },
          },
          { status: 400 },
        );
      }),
    );

    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open create dialog
    await user.click(screen.getByRole('button', { name: /добавить транзакцию/i }));
    await screen.findByRole('heading', { name: /добавить транзакцию/i });

    // Fill form
    await user.type(screen.getByLabelText(/сумма/i), '100.00');

    // Select category
    const categoryTrigger = screen.getByRole('combobox', { name: /категория/i });
    await user.click(categoryTrigger);
    const categoryOption = await screen.findByRole('option', { name: /еда и напитки/i });
    await user.click(categoryOption);

    // Submit
    await user.click(screen.getByRole('button', { name: /добавить транзакцию$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ошибка валидации');
    });
  });

  it('should render page header and export button', async () => {
    renderTransactionsPage();

    expect(screen.getByRole('heading', { name: /транзакции/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /экспорт/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить транзакцию/i })).toBeInTheDocument();
  });

  it('should show error alert when transactions fetch fails', async () => {
    server.use(http.get('*/api/transactions', () => HttpResponse.error()));

    renderTransactionsPage();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/не удалось загрузить транзакции/i)).toBeInTheDocument();
  });

  it('should constrain dateTo min when dateFrom is set', async () => {
    const { user } = renderTransactionsPage();
    await screen.findByText('Monthly salary');

    const dateFromInput = screen.getByLabelText('С');
    const dateToInput = screen.getByLabelText('По');

    await user.type(dateFromInput, '2025-01-15');
    expect(dateToInput).toHaveAttribute('min', '2025-01-15');
  });

  it('should not show loading skeleton when switching type tabs', async () => {
    const { user } = renderTransactionsPage();
    await screen.findByText('Monthly salary');

    // Switch to Income tab
    await user.click(screen.getByRole('tab', { name: /доходы/i }));

    // keepPreviousData should prevent skeleton flash
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0);

    // New filtered data still loads
    await waitFor(() => {
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    });
  });

  it('should show all category options in filter dropdown', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open category filter — find the Select trigger for category filter
    const allComboboxes = screen.getAllByRole('combobox');
    // The filter category select is the one outside the dialog
    const categoryFilter = allComboboxes.find((el) => el.textContent?.includes('Все категории'));
    if (!categoryFilter) throw new Error('Category filter combobox not found');
    await user.click(categoryFilter);

    const expectedCategoryNames = ['Еда и напитки', 'Транспорт', 'Зарплата'];
    for (const name of expectedCategoryNames) {
      expect(await screen.findByRole('option', { name: new RegExp(name) })).toBeInTheDocument();
    }
  });
});
