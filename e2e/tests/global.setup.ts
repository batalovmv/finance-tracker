import fs from 'fs';
import path from 'path';

import { test as setup, expect } from '@playwright/test';

import { API_URL, AUTH_FILE, TEST_USER } from './helpers';

setup('create test user and authenticate', async ({ request, page }) => {
  const authDir = path.resolve(path.dirname(AUTH_FILE));
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Register test user (ignore if already exists)
  await request.post(`${API_URL}/auth/register`, {
    data: TEST_USER,
    failOnStatusCode: false,
  });

  // Login via browser to set httpOnly refresh cookie
  await page.goto('/login');
  await page.getByLabel('Электронная почта').fill(TEST_USER.email);
  await page.getByLabel('Пароль').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
