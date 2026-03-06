import { test, expect } from '@playwright/test';

import { TEST_USER } from './helpers';

test.describe('Navigation', () => {
  test('should navigate between pages using sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();

    await page.getByRole('link', { name: 'Транзакции' }).click();
    await expect(page).toHaveURL('/transactions');
    await expect(page.getByRole('heading', { name: 'Транзакции' })).toBeVisible();

    await page.getByRole('link', { name: 'Статистика' }).click();
    await expect(page).toHaveURL('/statistics');
    await expect(page.getByRole('heading', { name: 'Статистика' })).toBeVisible();

    await page.getByRole('link', { name: 'Главная' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();

    const initialClass = await page.locator('html').getAttribute('class');
    const wasInitiallyDark = initialClass?.includes('dark') ?? false;

    await page.getByRole('button', { name: 'Переключить тему' }).click();

    if (wasInitiallyDark) {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).toHaveClass(/dark/);
    }

    // Toggle back
    await page.getByRole('button', { name: 'Переключить тему' }).click();

    if (wasInitiallyDark) {
      await expect(page.locator('html')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
  });

  test('should display user name in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
  });
});
