import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

/**
 * WP-845 — Login heading reads "Sign in to your account" (reverses WP-844).
 *
 * The ticket title's "Sign in to you account" is a confirmed typo; the shipped
 * string keeps the "r".
 *
 * Credentials come from the untracked .env.local (QA_E2E_EMAIL /
 * QA_E2E_PASSWORD). This spec deliberately does NOT use
 * tests/e2e/utils/auth.ts ADMIN_CREDENTIALS: that is a shared global-org admin
 * whose password is committed in plaintext, and step 8 of the loop re-runs this
 * spec against https://portal.appguard.ai.
 */
const HEADING = 'Sign in to your account';

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

// Tests 1-3 are credential-free: the login page is public.
test.describe('WP-845 — login heading copy', () => {
  test('/login heading reads "Sign in to your account"', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: HEADING, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Login', exact: true }),
    ).toHaveCount(0);
    // Guard against the ticket-title typo shipping.
    await expect(page.getByText('Sign in to you account')).toHaveCount(0);
  });

  test('/login/[account_id] heading reads "Sign in to your account"', async ({
    page,
  }) => {
    await page.goto('/login/anything');
    await expect(
      page.getByRole('heading', { name: HEADING, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Login', exact: true }),
    ).toHaveCount(0);
    await expect(page.getByText('Sign in to you account')).toHaveCount(0);
  });

  test('rest of the login page is unchanged', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    // Submit button copy is deliberately NOT part of this ticket.
    await expect(loginPage.submitButton).toHaveText(/Sign in/);
  });
});

// Only this last check signs in, using the dedicated QA identity.
test.describe('WP-845 — login still works after the copy change', () => {
  test.skip(
    !email || !password,
    'QA_E2E_EMAIL / QA_E2E_PASSWORD not set — export them from .env.local',
  );

  test('QA account signs in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(
      page.getByRole('heading', { name: HEADING, exact: true }),
    ).toBeVisible();

    await loginPage.login(email!, password!);

    // Leaving /login is the real assertion; a failed sign-in keeps us there.
    // Note: '/login-organization' also startsWith('/login'), so match the known
    // post-login destinations explicitly.
    await page.waitForURL(
      (url) =>
        url.pathname.includes('/portal') ||
        url.pathname.includes('/login-organization') ||
        url.pathname.includes('/setup-password'),
      { timeout: 30_000 },
    );
    expect(
      page.url().includes('/portal') ||
        page.url().includes('/login-organization') ||
        page.url().includes('/setup-password'),
    ).toBe(true);
  });
});
