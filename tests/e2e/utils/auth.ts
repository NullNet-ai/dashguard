import { type Page } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

export const ADMIN_CREDENTIALS = {
  email: 'admin@dnamicro.com',
  password: 'ch@ng3m3Pl3@s3!!',
} as const;

export async function loginAsAdmin(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15000,
  });

  return loginPage;
}
