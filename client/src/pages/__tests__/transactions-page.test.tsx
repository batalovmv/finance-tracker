import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';

import { mockCategories, mockTransactions } from '@/test/msw/handlers';
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
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
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

    expect(await screen.findByText('No transactions found')).toBeInTheDocument();
  });

  it('should filter by type when Income tab is clicked', async () => {
    const { user } = renderTransactionsPage();

    // Wait for initial data
    expect(await screen.findByText('Monthly salary')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /income/i }));

    // After clicking Income tab, the handler filters by type
    await waitFor(() => {
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
      expect(screen.queryByText('Lunch with team')).not.toBeInTheDocument();
    });
  });

  it('should open create dialog when Add Transaction is clicked', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(await screen.findByRole('heading', { name: /add transaction/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it('should create a transaction and show success toast', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open create dialog
    await user.click(screen.getByRole('button', { name: /add transaction/i }));
    await screen.findByRole('heading', { name: /add transaction/i });

    // Fill form
    await user.type(screen.getByLabelText(/amount/i), '100.00');

    // Select category — need to open the category select
    const categoryTrigger = screen.getByRole('combobox', { name: /category/i });
    await user.click(categoryTrigger);

    // Find and click the first expense category
    const categoryOption = await screen.findByRole('option', { name: /food & dining/i });
    await user.click(categoryOption);

    // Submit
    await user.click(screen.getByRole('button', { name: /add transaction$/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Transaction created');
    });
  });

  it('should open edit dialog with pre-filled data', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Click the actions menu for the first transaction
    const actionButtons = screen.getAllByRole('button', { name: /actions/i });
    await user.click(actionButtons[0]);

    // Click Edit
    const editOption = await screen.findByRole('menuitem', { name: /edit/i });
    await user.click(editOption);

    // Verify pre-filled data
    expect(await screen.findByRole('heading', { name: /edit transaction/i })).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/amount/i);
    expect(amountInput).toHaveValue(mockTransactions[0].amount);
  });

  it('should update a transaction and show success toast', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open edit dialog via actions menu
    const actionButtons = screen.getAllByRole('button', { name: /actions/i });
    await user.click(actionButtons[0]);
    const editOption = await screen.findByRole('menuitem', { name: /edit/i });
    await user.click(editOption);

    await screen.findByRole('heading', { name: /edit transaction/i });

    // Change amount
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '2000.00');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Transaction updated');
    });
  });

  it('should open delete dialog and confirm deletion', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Click the actions menu
    const actionButtons = screen.getAllByRole('button', { name: /actions/i });
    await user.click(actionButtons[0]);

    // Click Delete
    const deleteOption = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteOption);

    // Verify confirmation dialog
    expect(await screen.findByRole('heading', { name: /delete transaction/i })).toBeInTheDocument();

    // Confirm delete
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Transaction deleted');
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
    await user.click(screen.getByRole('button', { name: /add transaction/i }));
    await screen.findByRole('heading', { name: /add transaction/i });

    // Fill form
    await user.type(screen.getByLabelText(/amount/i), '100.00');

    // Select category
    const categoryTrigger = screen.getByRole('combobox', { name: /category/i });
    await user.click(categoryTrigger);
    const categoryOption = await screen.findByRole('option', { name: /food & dining/i });
    await user.click(categoryOption);

    // Submit
    await user.click(screen.getByRole('button', { name: /add transaction$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid amount');
    });
  });

  it('should render page header and export button', async () => {
    renderTransactionsPage();

    expect(screen.getByRole('heading', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });

  it('should show all category options in filter dropdown', async () => {
    const { user } = renderTransactionsPage();

    await screen.findByText('Monthly salary');

    // Open category filter — find the Select trigger for category filter
    const allComboboxes = screen.getAllByRole('combobox');
    // The filter category select is the one outside the dialog
    const categoryFilter = allComboboxes.find((el) => el.textContent?.includes('All categories'));
    if (!categoryFilter) throw new Error('Category filter combobox not found');
    await user.click(categoryFilter);

    for (const cat of mockCategories) {
      expect(await screen.findByRole('option', { name: new RegExp(cat.name) })).toBeInTheDocument();
    }
  });
});
