import { expect, test } from '@playwright/test';

import { LoginPage } from './LoginPage';
import { ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display the login form controls', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('should redirect an authenticated user to the next portal step', async ({ page }) => {
    await loginPage.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    await page.waitForURL(
      (url) =>
        url.pathname.includes('/portal') ||
        url.pathname.includes('/login-organization') ||
        url.pathname.includes('/setup-password'),
      { timeout: 15000 },
    );
    expect(
      page.url().includes('/portal') ||
        page.url().includes('/login-organization') ||
        page.url().includes('/setup-password'),
    ).toBe(true);
  });

  test('should display an email validation error for an invalid email format', async ({ page }) => {
    await loginPage.emailInput.fill('notanemail');
    await loginPage.passwordInput.fill('anypassword');
    await loginPage.submitButton.click();
    await expect(page.getByText('Please enter a valid email.')).toBeVisible();
  });

  test('should require an email when the form is submitted empty', async ({ page }) => {
    await loginPage.submitButton.click();
    await expect(page.getByText('Email is required.')).toBeVisible();
  });

  test('should display a server error for an incorrect password', async () => {
    await loginPage.login(ADMIN_CREDENTIALS.email, 'wrongpassword123');
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password when the link is selected', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot-password/);
  });
});
