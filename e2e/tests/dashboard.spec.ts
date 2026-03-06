import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText('Всего доходов')).toBeVisible();
    await expect(page.getByText('Всего расходов')).toBeVisible();
    await expect(page.getByText('Баланс')).toBeVisible();
  });

  test('should display recent transactions section', async ({ page }) => {
    await expect(page.getByText('Последние транзакции')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Все' })).toBeVisible();
  });

  test('should navigate to transactions from View all link', async ({ page }) => {
    await page.getByRole('link', { name: 'Все' }).click();
    await expect(page).toHaveURL('/transactions');
  });

  test('should display expenses by category section', async ({ page }) => {
    await expect(page.getByText('Расходы по категориям')).toBeVisible();
  });
});
