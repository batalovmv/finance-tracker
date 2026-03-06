import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText('Total Income')).toBeVisible();
    await expect(page.getByText('Total Expenses')).toBeVisible();
    await expect(page.getByText('Balance')).toBeVisible();
  });

  test('should display recent transactions section', async ({ page }) => {
    await expect(page.getByText('Recent Transactions')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View all' })).toBeVisible();
  });

  test('should navigate to transactions from View all link', async ({ page }) => {
    await page.getByRole('link', { name: 'View all' }).click();
    await expect(page).toHaveURL('/transactions');
  });

  test('should display expenses by category section', async ({ page }) => {
    await expect(page.getByText('Expenses by Category')).toBeVisible();
  });
});
