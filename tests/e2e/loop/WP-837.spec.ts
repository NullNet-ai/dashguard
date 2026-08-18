import { expect, test, type Page } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// WP-837 — Role Wizard > Step 1 > Basic Details: clicking "Show Grid" must list
// Draft records ONLY.
//
// Owner clarification: "I mean here, when clicking 'Show Grid', the list of
// items, filter show Draft only."
//
// Navigation is done from the wizard entry point (/portal/user_role/wizard/new/1)
// so the spec never depends on a hardcoded record code existing.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

const WIZARD_STEP_1 = '/portal/user_role/wizard/new/1';
const NON_DRAFT_STATUSES = ['Active', 'Archived', 'Inactive'];

const showGridButton = (page: Page) =>
  page.getByRole('button', { name: 'Show Grid', exact: true }).first();

/** The form-filter sub-grid rendered underneath the Basic Details form. */
const subGrid = (page: Page) => page.locator('table').last();

async function statusColumnIndex(page: Page) {
  const headers = subGrid(page).locator('thead th');
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    const text = ((await headers.nth(i).innerText()) || '').trim();
    if (/^status$/i.test(text)) return i;
  }
  return -1;
}

test.describe('WP-837 — Role Wizard Step 1 "Show Grid" lists Draft only', () => {
  test.skip(
    !email || !password,
    'QA_E2E_EMAIL / QA_E2E_PASSWORD not set — export them from .env.local',
  );

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email!, password!);
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 20000,
    });

    await page.goto(WIZARD_STEP_1);
    await expect(
      page.getByText('Basic Details', { exact: true }).first(),
    ).toBeVisible({ timeout: 20000 });
  });

  test('the grid query asks the backend for Draft records only', async ({
    page,
  }) => {
    const gridItemsRequest = page.waitForRequest(
      (req) => req.url().includes('grid.items'),
      { timeout: 20000 },
    );

    await showGridButton(page).click();

    const req = await gridItemsRequest;
    const input = decodeURIComponent(req.url());

    expect(
      input,
      'grid.items input must carry a status advance filter',
    ).toContain('"field":"status"');
    expect(input, 'status filter must select Draft').toContain('"Draft"');
    for (const status of NON_DRAFT_STATUSES) {
      expect(
        input,
        `grid.items must NOT request status "${status}"`,
      ).not.toContain(`"${status}"`);
    }
  });

  test('every row shown in the grid has status Draft', async ({ page }) => {
    await showGridButton(page).click();

    const rows = subGrid(page).locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const index = await statusColumnIndex(page);
    expect(index, 'Status column must be present in the sub-grid').toBeGreaterThanOrEqual(0);

    const rowCount = await rows.count();
    expect(rowCount, 'grid should render at least one Draft row').toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const status = (
        (await rows.nth(i).locator('td').nth(index).innerText()) || ''
      ).trim();
      expect(status, `row ${i} status must be Draft`).toBe('Draft');
    }
  });

  test('no non-Draft status badge is visible in the grid', async ({ page }) => {
    await showGridButton(page).click();

    const rows = subGrid(page).locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    for (const status of NON_DRAFT_STATUSES) {
      await expect(
        subGrid(page).getByText(status, { exact: true }),
        `"${status}" must not appear in the Draft-only list`,
      ).toHaveCount(0);
    }
  });
});
