import { expect, test } from '@playwright/test';

test.describe('WP-844 — login heading label', () => {
  test('/login shows "Login" instead of "Sign in to your account"', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByText('Sign in to your account')).toHaveCount(0);
  });

  test('/login/[account_id] shows "Login" instead of "Sign in to your account"', async ({ page }) => {
    await page.goto('/login/anything');
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByText('Sign in to your account')).toHaveCount(0);
  });
});
