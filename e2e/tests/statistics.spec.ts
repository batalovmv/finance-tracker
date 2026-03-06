import { test, expect } from '@playwright/test';

test.describe('Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics');
    await expect(page.getByRole('heading', { name: 'Статистика' })).toBeVisible();
  });

  test('should display period selector with default 12 Months', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Этот месяц' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '3 месяца' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '6 месяцев' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '12 месяцев' })).toBeVisible();

    await expect(page.getByRole('tab', { name: '12 месяцев' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText('Всего доходов')).toBeVisible();
    await expect(page.getByText('Всего расходов')).toBeVisible();
    await expect(page.getByText('Баланс')).toBeVisible();
  });

  test('should display category breakdown with type toggle', async ({ page }) => {
    await expect(page.getByText('По категориям')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Расходы' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Доходы' })).toBeVisible();
  });

  test('should switch between periods', async ({ page }) => {
    await page.getByRole('tab', { name: 'Этот месяц' }).click();
    await expect(page.getByRole('tab', { name: 'Этот месяц' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: '3 месяца' }).click();
    await expect(page.getByRole('tab', { name: '3 месяца' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('should display monthly trend section', async ({ page }) => {
    await expect(page.getByText('Помесячная динамика')).toBeVisible();
  });

  test('should toggle between expense and income categories', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Расходы' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: 'Доходы' }).click();
    await expect(page.getByRole('tab', { name: 'Доходы' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('tab', { name: 'Расходы' }).click();
    await expect(page.getByRole('tab', { name: 'Расходы' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
