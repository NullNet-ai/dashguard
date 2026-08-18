import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// WP-838 — Device Group Wizard > Step 1 (Basic Details): clicking "Show Grid"
// must list ONLY Draft records.
//
// Requirement inferred from sibling ticket WP-837 (Role Wizard, identical
// wording), clarified by the owner as: "when clicking 'Show Grid', the list of
// items, filter show Draft only."
//
// No record code is hardcoded: the wizard is entered at /wizard/new/1, which is
// the same entry point the grid's "New" button uses.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

// Sub-grid inside the form filter renders with the filter_entity as its prefix
// (src/components/platform/Grid/TableBody.tsx:98 + testIDFormatter).
const TABLE_BODY = '[data-test-id="device-group-settings-grid-table-body"]';

test.describe('WP-838 — Device Group wizard step 1 "Show Grid" is Draft-only', () => {
  // Turbopack compiles the wizard route on first hit; a login + cold compile
  // easily exceeds Playwright's default 30s budget. Kept parallel (not serial)
  // so one failure does not mask the others.
  test.describe.configure({ timeout: 180_000 });

  test.skip(
    !email || !password,
    'QA_E2E_EMAIL / QA_E2E_PASSWORD not set — export them from .env.local',
  );

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email!, password!);
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 30000,
    });

    await page.goto('/portal/device_group/wizard/new/1');
    await page.waitForLoadState('networkidle');
  });

  test('the "Show Grid" control exists on Basic Details', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Show Grid' }).first(),
    ).toBeVisible({ timeout: 30000 });
  });

  test('every row in the revealed grid has status Draft', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Grid' }).first().click();

    const tableBody = page.locator(TABLE_BODY).first();
    await expect(tableBody).toBeVisible({ timeout: 30000 });

    const statusCells = tableBody.locator(
      '[data-test-id^="device-group-settings-grid-table-body-row-cell-status-"]',
    );
    await expect
      .poll(async () => await statusCells.count(), { timeout: 30000 })
      .toBeGreaterThan(0);

    const statuses = (await statusCells.allInnerTexts()).map((s) => s.trim());
    expect(statuses.length, 'grid should render at least one row').toBeGreaterThan(0);
    for (const status of statuses) {
      expect(status, `unexpected non-Draft row status "${status}"`).toBe('Draft');
    }
  });

  test('no Active or Archived record is listed', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Grid' }).first().click();

    const tableBody = page.locator(TABLE_BODY).first();
    await expect(tableBody).toBeVisible({ timeout: 30000 });

    const statusCells = tableBody.locator(
      '[data-test-id^="device-group-settings-grid-table-body-row-cell-status-"]',
    );
    await expect
      .poll(async () => await statusCells.count(), { timeout: 30000 })
      .toBeGreaterThan(0);

    await expect(tableBody.getByText('Active', { exact: true })).toHaveCount(0);
    await expect(tableBody.getByText('Archived', { exact: true })).toHaveCount(0);
  });

  test('the main Device Group grid is unaffected and still lists non-Draft records', async ({
    page,
  }) => {
    // Scope guard: the change must not leak into /portal/device_group/grid.
    await page.goto('/portal/device_group/grid');
    await page.waitForLoadState('networkidle');

    const tableBody = page.locator(TABLE_BODY).first();
    await expect(tableBody).toBeVisible({ timeout: 30000 });

    const statuses = (
      await tableBody
        .locator(
          '[data-test-id^="device-group-settings-grid-table-body-row-cell-status-"]',
        )
        .allInnerTexts()
    ).map((s) => s.trim());
    expect(statuses.length).toBeGreaterThan(0);
    // At least one non-Draft row proves the main grid was not narrowed.
    expect(statuses.some((s) => s !== 'Draft')).toBe(true);
  });
});
