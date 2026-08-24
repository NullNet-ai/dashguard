import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// Post-deploy verification for WP-829 (Device Group column on the Device Grid).
//
// STRICTLY READ-ONLY — runs against PRODUCTION, creates nothing, mutates
// nothing, needs no cleanup.
//
// WHY THIS EXISTS. WP-829 adds a left join from `devices` to the one-to-many
// `device_groups`, on top of the one-to-many `device_services` join mainGrid
// already had. If this ORM fanned rows out instead of aggregating joined rows
// into arrays, a device in N groups would appear N times and `totalCount` would
// inflate — silently corrupting the portal's busiest grid and its pagination.
//
// The evidence says it aggregates: `device_services` is already joined this way
// and yields `device_services_protocols` as an array with correct paging. But
// that could not be proven against the production Store before merging, so it
// is proven here instead. The device grid pages at 100 rows, so the fan-out
// signature is a duplicate device code within a single page — a device in two
// groups appearing twice.
//
// If this spec fails, the correct response is to revert WP-829, not to relax it.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

const TABLE_BODY = '[data-test-id="device-grid-table-body"]';
const CODE_CELL = '[data-test-id^="device-grid-table-body-row-cell-code-"]';

/** The device grid's page size. Measured on production, before and after. */
const PAGE_SIZE = 100;

test.describe('WP-829 post-deploy — Device Group column', () => {
  test.describe.configure({ timeout: 180_000 });

  // A missing credential must FAIL, not skip: a skipped post-deploy check is a
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
    await page.goto('/portal/device/grid');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(TABLE_BODY).first()).toBeVisible({
      timeout: 60_000,
    });
  });

  test('the join did not duplicate device rows', async ({ page }) => {
    const codeCells = page.locator(CODE_CELL);
    await expect
      .poll(async () => await codeCells.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    const codes = (await codeCells.allInnerTexts()).map((t) => t.trim());
    const unique = new Set(codes);

    // The fan-out signature. A device belonging to two groups appearing twice
    // would show up here and nowhere else in the test suite.
    expect(
      unique.size,
      `duplicate device codes on the page — the device_groups join is fanning rows out. Duplicates: ${codes
        .filter((c, i) => codes.indexOf(c) !== i)
        .slice(0, 5)
        .join(', ')}`,
    ).toBe(codes.length);
  });

  test('the page still returns a full page of devices', async ({ page }) => {
    const codeCells = page.locator(CODE_CELL);
    await expect
      .poll(async () => await codeCells.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    const count = await codeCells.count();

    // Fan-out would multiply rows, overflowing the page size; a broken join
    // would collapse it. Exactly one page of devices is the healthy shape.
    expect(
      count,
      `expected a full page of ${PAGE_SIZE} devices, got ${count}`,
    ).toBe(PAGE_SIZE);
  });

  test('the Device Group column renders and is populated for at least one device', async ({
    page,
  }) => {
    // NOTE the test id is derived from the accessorKey `device_group_names`,
    // not from the header text "Device Group". Guessing the header-based form
    // is what made this spec fail on its first production run.
    // The column must exist...
    await expect(
      page.locator('[data-test-id="device-grid-table-head-row-device-group-names"]'),
    ).toHaveCount(1);

    // ...and must actually carry data for someone. An entirely empty column
    // would mean the join returned nothing and the feature is cosmetic only —
    // the same silent-empty failure mode measured on WP-838. Devices with no
    // group legitimately render blank, so this asserts "at least one", not "all".
    const groupCells = page.locator(
      '[data-test-id^="device-grid-table-body-row-cell-device-group-names-"]',
    );
    await expect
      .poll(async () => await groupCells.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    const texts = (await groupCells.allInnerTexts()).map((t) => t.trim());
    expect(
      texts.some((t) => t.length > 0),
      'every Device Group cell is empty — the join returned no group names for any device',
    ).toBe(true);
  });
});
