import { test, expect } from '@playwright/test';

import { TEST_USER } from './helpers';

test.describe('Navigation', () => {
  test('should navigate between pages using sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Transactions' }).click();
    await expect(page).toHaveURL('/transactions');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    await page.getByRole('link', { name: 'Statistics' }).click();
    await expect(page).toHaveURL('/statistics');
    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    const initialClass = await page.locator('html').getAttribute('class');
    const wasInitiallyDark = initialClass?.includes('dark') ?? false;

    await page.getByRole('button', { name: 'Toggle theme' }).click();

    if (wasInitiallyDark) {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).toHaveClass(/dark/);
    }

    // Toggle back
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    if (wasInitiallyDark) {
      await expect(page.locator('html')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
  });

  test('should display user name in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
  });
});
