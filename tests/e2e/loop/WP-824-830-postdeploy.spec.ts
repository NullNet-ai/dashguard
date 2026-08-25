import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// Post-deploy verification for the main-2464 batch: WP-824 (Device Group column
// on the Contact Grid) and WP-830 (bulk assign Device Group on the Device Grid).
//
// STRICTLY READ-ONLY. Runs against PRODUCTION. Selecting grid rows is a local
// UI state change that writes nothing, so it is safe; the assign mutation is
// never invoked. Nothing is created and no cleanup is needed.
//
// THE CHECK THAT MATTERS MOST is the bulk-Archive one below. WP-830 turned on
// `enableRowSelection` for the Device Grid, which had been off. Row selection is
// what makes the shared Grid's built-in bulk Archive button appear — and
// BulkArchive bypasses the wallguard-cli leave/stop teardown that this grid's
// own archiveCustomAction performs. If enabling selection exposed that button,
// a user could bulk-archive devices while skipping their teardown. The config
// hides it deliberately; this proves the hiding actually works in production.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

const DEVICE_BODY = '[data-test-id="device-grid-table-body"]';
const CONTACT_BODY = '[data-test-id="contact-grid-table-body"]';

const login = async (page: any) => {
  expect(
    Boolean(email && password),
    'QA_E2E_EMAIL / QA_E2E_PASSWORD must be exported — run `set -a; . ./.env.local; set +a`',
  ).toBe(true);
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email!, password!);
  await page.waitForURL((url: URL) => !url.pathname.startsWith('/login'), {
    timeout: 60_000,
  });
};

test.describe('post-deploy — batch main-2464', () => {
  test.describe.configure({ timeout: 180_000 });

  test('WP-830: selecting devices does NOT expose the bulk Archive button', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/portal/device/grid');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(DEVICE_BODY).first()).toBeVisible({
      timeout: 60_000,
    });

    // Row selection must now be available — that is the WP-830 change.
    const checkboxes = page.locator(`${DEVICE_BODY} input[type="checkbox"], ${DEVICE_BODY} [role="checkbox"]`);
    await expect
      .poll(async () => await checkboxes.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    await checkboxes.first().click();

    // Give the header a moment to react to the selection.
    await page.waitForTimeout(2000);

    // ...and with a row selected, Archive must NOT be offered in bulk.
    const bodyText = await page.locator('body').innerText();
    expect(
      bodyText.includes('Archive'),
      'a bulk Archive control appeared once rows were selected — BulkArchive skips the wallguard-cli teardown this grid performs',
    ).toBe(false);
  });

  test('WP-830: the Assign Device Group control is reachable', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/portal/device/grid');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(DEVICE_BODY).first()).toBeVisible({
      timeout: 60_000,
    });

    const checkboxes = page.locator(`${DEVICE_BODY} input[type="checkbox"], ${DEVICE_BODY} [role="checkbox"]`);
    await expect
      .poll(async () => await checkboxes.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);
    await checkboxes.first().click();
    await page.waitForTimeout(2000);

    // The button only renders with a selection, so this also proves the
    // selection state is reaching it. The dialog is NOT opened and no
    // assignment is performed.
    await expect(
      page.getByRole('button', { name: /assign device group/i }).first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('WP-824: the Contact Grid still lists contacts and has a Device Group column', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/portal/contact/grid');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(CONTACT_BODY).first()).toBeVisible({
      timeout: 60_000,
    });

    // NOTE: unlike the device grid, the Contact Grid emits NO data-test-id on
    // its rows or cells — only on the table body and the column headers. So
    // identity is asserted against rendered text, not cell test ids. Guessing
    // the device grid's cell pattern here is what made this spec fail first run.
    const tbodyText = await page.locator('tbody').first().innerText();
    const codes = tbodyText.match(/CO\d{6}/g) ?? [];

    // Non-empty guard: the extra lookup must not have emptied or broken the
    // grid. A column assertion is vacuous on an empty grid.
    expect(
      codes.length,
      'the contact grid rendered no contact codes — the WP-824 lookup may have broken it',
    ).toBeGreaterThan(0);

    // Contacts must not be duplicated — the lookup merges by contact id into
    // the existing rows and must not multiply them.
    expect(new Set(codes).size, 'duplicate contact codes on the page').toBe(
      codes.length,
    );

    // The column header derives from the accessorKey, not the header text.
    await expect(
      page.locator(
        '[data-test-id="contact-grid-table-head-row-device-group-names"]',
      ),
    ).toHaveCount(1);
  });
});
