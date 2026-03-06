import { test, expect } from '@playwright/test';

test.describe('Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics');
    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible();
  });

  test('should display period selector with default 12 Months', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'This Month' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '3 Months' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '6 Months' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '12 Months' })).toBeVisible();

    await expect(page.getByRole('tab', { name: '12 Months' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText('Total Income')).toBeVisible();
    await expect(page.getByText('Total Expenses')).toBeVisible();
    await expect(page.getByText('Balance')).toBeVisible();
  });

  test('should display category breakdown with type toggle', async ({ page }) => {
    await expect(page.getByText('By Category')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Expenses' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Income' })).toBeVisible();
  });

  test('should switch between periods', async ({ page }) => {
    await page.getByRole('tab', { name: 'This Month' }).click();
    await expect(page.getByRole('tab', { name: 'This Month' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: '3 Months' }).click();
    await expect(page.getByRole('tab', { name: '3 Months' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('should display monthly trend section', async ({ page }) => {
    await expect(page.getByText('Monthly Trend')).toBeVisible();
  });

  test('should toggle between expense and income categories', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Expenses' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: 'Income' }).click();
    await expect(page.getByRole('tab', { name: 'Income' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: 'Expenses' }).click();
    await expect(page.getByRole('tab', { name: 'Expenses' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
