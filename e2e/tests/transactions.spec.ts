import { test, expect } from '@playwright/test';

test.describe.serial('Transactions', () => {
  const testId = Date.now().toString();

  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions');
    await expect(page.getByRole('heading', { name: 'Транзакции' })).toBeVisible();
  });

  test('should display transactions page structure', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Добавить транзакцию' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Экспорт' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Все' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Доходы' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Расходы' })).toBeVisible();
  });

  test('should create an expense transaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить транзакцию' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Type defaults to Expense
    await dialog.getByLabel('Сумма').fill('42.50');

    // Select category
    await dialog.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Food & Dining' }).click();

    await dialog.getByLabel('Описание (необязательно)').fill(`Expense ${testId}`);

    // Submit via the dialog button
    await dialog.getByRole('button', { name: 'Добавить транзакцию' }).click();

    // Verify transaction appears
    await expect(page.getByText(`Expense ${testId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should create an income transaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить транзакцию' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Change type to Income
    await dialog.getByLabel('Тип').click();
    await page.getByRole('option', { name: 'Доход' }).click();

    await dialog.getByLabel('Сумма').fill('1500.00');

    await dialog.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Salary' }).click();

    await dialog.getByLabel('Описание (необязательно)').fill(`Income ${testId}`);

    await dialog.getByRole('button', { name: 'Добавить транзакцию' }).click();

    await expect(page.getByText(`Income ${testId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit a transaction', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: `Expense ${testId}` });
    await row.getByRole('button', { name: 'Действия' }).click();
    await page.getByRole('menuitem', { name: 'Редактировать' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Редактировать транзакцию')).toBeVisible();

    await dialog.getByLabel('Сумма').clear();
    await dialog.getByLabel('Сумма').fill('55.00');

    await dialog.getByLabel('Описание (необязательно)').clear();
    await dialog.getByLabel('Описание (необязательно)').fill(`Edited ${testId}`);

    await dialog.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(`Edited ${testId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should filter transactions by type', async ({ page }) => {
    // Filter by Income
    await page.getByRole('tab', { name: 'Доходы' }).click();
    await expect(page.getByText(`Income ${testId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Edited ${testId}`)).not.toBeVisible();

    // Filter by Expense
    await page.getByRole('tab', { name: 'Расходы' }).click();
    await expect(page.getByText(`Edited ${testId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Income ${testId}`)).not.toBeVisible();

    // Reset to All
    await page.getByRole('tab', { name: 'Все' }).click();
    await expect(page.getByText(`Edited ${testId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Income ${testId}`)).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: `Edited ${testId}` });
    await row.getByRole('button', { name: 'Действия' }).click();
    await page.getByRole('menuitem', { name: 'Удалить' }).click();

    // Confirm deletion
    await expect(page.getByText('Вы уверены, что хотите удалить эту транзакцию?')).toBeVisible();
    await page.getByRole('button', { name: 'Удалить' }).click();

    await expect(page.getByText(`Edited ${testId}`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should export transactions to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Экспорт' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
