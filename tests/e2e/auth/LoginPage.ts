import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-test-id="login-input-username"]');
    this.passwordInput = page.locator('[data-test-id="login-input-password"]');
    this.submitButton = page.locator('[data-test-id="login-submit-button"]');
    this.rememberMeCheckbox = page.locator(
      '[data-test-id="login-remember-me-checkbox"]',
    );
    this.forgotPasswordLink = page.locator(
      '[data-test-id="login-forgot-password-link"]',
    );
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
