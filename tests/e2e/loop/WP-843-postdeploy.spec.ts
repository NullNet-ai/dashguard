import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// Post-deploy verification for the 2026-08-25 batch (pipeline 2458).
//
// STRICTLY READ-ONLY. This runs against PRODUCTION, so it creates nothing,
// mutates nothing, and therefore needs no cleanup. WP-841 (regenerate a join
// code) and WP-842 (change the platform-wide WG agent version) are deliberately
// NOT automated here: verifying them means mutating real production state — a
// live device's enrolment credential, and the version string every operator
// downloads against. Those need a human QA decision, not an unattended script.
//
// What this does check is the one thing with real blast radius:
//
//   WP-843 rewired where the Device Grid gets is_device_online from. If the
//   Store silently rejects device_online_statuses, the design is supposed to
//   degrade to the stored flag and leave the grid intact. A grid that came back
//   EMPTY would mean that safety property failed and the batch needs reverting.
//
// So the assertion that matters is "the device grid still lists devices".

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

// The grid's test IDs are built from `state.config.entity`, which is the
// SINGULAR 'device' here — not the plural 'devices' the router uses internally.
const TABLE_BODY = '[data-test-id="device-grid-table-body"]';
const ROW = '[data-test-id^="device-grid-table-body-row-cell-code-"]';
const STATUS_CELL =
  '[data-test-id^="device-grid-table-body-row-cell-is-device-online-"]';

test.describe('post-deploy — batch main-2458', () => {
  test.describe.configure({ timeout: 180_000 });

  // A missing credential must FAIL, not skip. A skipped post-deploy check is a
  // green result that verified nothing (measured on WP-838, log L002520).
  test.beforeEach(async ({ page }) => {
    expect(
      Boolean(email && password),
      'QA_E2E_EMAIL / QA_E2E_PASSWORD must be exported — run `set -a; . ./.env.local; set +a`',
    ).toBe(true);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email!, password!);
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 60_000,
    });
  });

  test('WP-843: the device grid still lists devices after the status rewire', async ({
    page,
  }) => {
    await page.goto('/portal/device/grid');
    await page.waitForLoadState('networkidle');

    const tableBody = page.locator(TABLE_BODY).first();
    await expect(tableBody).toBeVisible({ timeout: 60_000 });

    // The whole point: non-empty. An empty grid is the failure mode the
    // separate-query design exists to prevent, and would mean revert.
    const rows = tableBody.locator(ROW);
    await expect
      .poll(async () => await rows.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);
  });

  test('WP-843: connection status renders a real Online/Offline value', async ({
    page,
  }) => {
    await page.goto('/portal/device/grid');
    await page.waitForLoadState('networkidle');

    const statusCells = page.locator(STATUS_CELL);
    await expect
      .poll(async () => await statusCells.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    // Every rendered value must be one of the two real states — a blank or
    // undefined cell would mean the flattening lost the field.
    const texts = (await statusCells.allInnerTexts()).map((t) => t.trim());
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) {
      expect(['Online', 'Offline']).toContain(text);
    }
  });

  test('WP-839: the role wizard shows two steps ending in Confirmation', async ({
    page,
  }) => {
    // Loading step 1 is read-only — the Draft is only persisted by clicking
    // Next, which this test never does.
    await page.goto('/portal/user_role/wizard/new/1');
    await page.waitForLoadState('networkidle');

    // Asserted on body text rather than element visibility on purpose: the
    // vertical stepper is rendered with the class `lg-block hidden`
    // (Wizard/Header.tsx:101 — a typo for `lg:block`, flagged on WP-839 and
    // still unfixed), so the first "Basic Details" node on the page is
    // permanently invisible and a toBeVisible() assertion tests the typo, not
    // this ticket.
    await expect
      .poll(async () => (await page.locator('body').innerText()).includes('Basic Details'), {
        timeout: 60_000,
      })
      .toBe(true);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, 'Confirmation must still be reachable as step 2').toContain(
      'Confirmation',
    );
    expect(
      bodyText,
      'the Category Details step must be gone from the wizard',
    ).not.toContain('Category Details');
  });
});
