import { test, expect } from '@playwright/test';

import { API_URL, TEST_USER } from './helpers';

test.describe('Authentication', () => {
  test.beforeAll(async ({ request }) => {
    // Ensure test user exists for login/logout tests
    await request.post(`${API_URL}/auth/register`, {
      data: TEST_USER,
      failOnStatusCode: false,
    });
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Электронная почта')).toBeVisible();
    await expect(page.getByLabel('Пароль')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Зарегистрироваться' })).toBeVisible();
  });

  test('should show validation errors on empty login submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByText('Некорректный адрес электронной почты')).toBeVisible();
    await expect(page.getByText('Пароль обязателен')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Электронная почта').fill('nonexistent@example.com');
    await page.getByLabel('Пароль').fill('wrongpassword123');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Электронная почта').fill(TEST_USER.email);
    await page.getByLabel('Пароль').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    const uniqueEmail = `e2e-reg-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByLabel('Имя').fill('New Test User');
    await page.getByLabel('Электронная почта').fill(uniqueEmail);
    await page.getByLabel('Пароль').fill('StrongPassword123!');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    await expect(page).toHaveURL('/', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();
  });

  test('should show validation errors on empty registration', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page.getByText('Имя обязательно')).toBeVisible();
    await expect(page.getByText('Некорректный адрес электронной почты')).toBeVisible();
    await expect(page.getByText('Пароль должен содержать не менее 8 символов')).toBeVisible();
  });

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/register');

    await page.getByRole('link', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    await page.goto('/transactions');
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    await page.goto('/statistics');
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Электронная почта').fill(TEST_USER.email);
    await page.getByLabel('Пароль').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // Open user dropdown and logout
    await page.getByText(TEST_USER.name).click();
    await page.getByRole('menuitem', { name: 'Выйти' }).click();

    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
