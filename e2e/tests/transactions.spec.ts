import { test, expect } from '@playwright/test';

test.describe.serial('Transactions', () => {
  const testId = Date.now().toString();

  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
  });

  test('should display transactions page structure', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add Transaction' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Income' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Expense' })).toBeVisible();
  });

  test('should create an expense transaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Type defaults to Expense
    await dialog.getByLabel('Amount').fill('42.50');

    // Select category
    await dialog.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Food & Dining' }).click();

    await dialog.getByLabel('Description (optional)').fill(`Expense ${testId}`);

    // Submit via the dialog button
    await dialog.getByRole('button', { name: 'Add Transaction' }).click();

    // Verify transaction appears
    await expect(page.getByText(`Expense ${testId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should create an income transaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Change type to Income
    await dialog.getByLabel('Type').click();
    await page.getByRole('option', { name: 'Income' }).click();

    await dialog.getByLabel('Amount').fill('1500.00');

    await dialog.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Salary' }).click();

    await dialog.getByLabel('Description (optional)').fill(`Income ${testId}`);

    await dialog.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(page.getByText(`Income ${testId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit a transaction', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: `Expense ${testId}` });
    await row.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Edit Transaction')).toBeVisible();

    await dialog.getByLabel('Amount').clear();
    await dialog.getByLabel('Amount').fill('55.00');

    await dialog.getByLabel('Description (optional)').clear();
    await dialog.getByLabel('Description (optional)').fill(`Edited ${testId}`);

    await dialog.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText(`Edited ${testId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should filter transactions by type', async ({ page }) => {
    // Filter by Income
    await page.getByRole('tab', { name: 'Income' }).click();
    await expect(page.getByText(`Income ${testId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Edited ${testId}`)).not.toBeVisible();

    // Filter by Expense
    await page.getByRole('tab', { name: 'Expense' }).click();
    await expect(page.getByText(`Edited ${testId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Income ${testId}`)).not.toBeVisible();

    // Reset to All
    await page.getByRole('tab', { name: 'All' }).click();
    await expect(page.getByText(`Edited ${testId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Income ${testId}`)).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: `Edited ${testId}` });
    await row.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Confirm deletion
    await expect(page.getByText('Are you sure you want to delete this transaction?')).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText(`Edited ${testId}`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should export transactions to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
