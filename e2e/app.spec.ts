import { test, expect } from '@playwright/test';

test.describe('KIIS App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Onboarding flow', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('text=Bienvenido')).toBeVisible({ timeout: 10000 });
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Iniciar sesión')).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard loads when authenticated', async ({ page }) => {
    localStorage.setItem('access_token', 'test_token');
    localStorage.setItem('current_user', JSON.stringify({ email: 'test@test.com' }));
    await page.goto('/');
    await expect(page.locator('text=Hoy')).toBeVisible({ timeout: 10000 });
  });

  test('Assistant page loads', async ({ page }) => {
    await page.goto('/assistant');
    await expect(page.locator('input[placeholder*="preguntar"]')).toBeVisible({ timeout: 10000 });
  });
});
