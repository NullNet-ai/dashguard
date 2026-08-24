import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// Post-deploy verification for WP-831 (Device tab on the Device Group record).
//
// STRICTLY READ-ONLY. Runs against PRODUCTION: it opens a real device group
// record and reads the page. It never assigns or unassigns anything, so it
// creates no state and needs no cleanup.
//
// Assign/unassign is deliberately NOT automated. Exercising it here would
// change real device-group membership in production, which is a decision for a
// human QA pass, not an unattended script. The ordering contract that makes
// unassign safe (it sends the `device_groups` junction row id, never a device
// id) is pinned by unit tests in tests/unit/WP-831/ instead.
//
// What this proves: the new tab exists, is reachable, and its grid renders
// rather than erroring — which is what a wiring change can plausibly get wrong.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

// The grid's test ids come from `state.config.entity`, which for this page is
// `device_group_settings` — NOT the `device_group` in the route. Guessing from
// the URL is wrong here, and a wrong prefix fails identically to an empty grid.
const GROUP_GRID_BODY =
  '[data-test-id="device-group-settings-grid-table-body"]';

test.describe('WP-831 post-deploy — Device Group record Device tab', () => {
  test.describe.configure({ timeout: 180_000 });

  test('the Device tab is present on a device group record and its grid renders', async ({
    page,
  }) => {
    // Missing credentials must FAIL, never skip — a skipped post-deploy check
    // is a green result that verified nothing (measured on WP-838, L002520).
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

    // Reach a real group record through the grid rather than hardcoding a code,
    // so this keeps working as data changes.
    await page.goto('/portal/device_group/grid');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(GROUP_GRID_BODY).first()).toBeVisible({
      timeout: 60_000,
    });

    const firstCode = page
      .locator(
        '[data-test-id^="device-group-settings-grid-table-body-row-cell-code-"]',
      )
      .first();
    await expect(firstCode).toBeVisible({ timeout: 60_000 });
    const code = (await firstCode.innerText()).trim();
    expect(code, 'could not read a device group code from the grid').toBeTruthy();

    await page.goto(`/portal/device_group/record/${code}/device`);
    await page.waitForLoadState('networkidle');

    // The tab must be reachable — a mis-wired parallel route would 404 or land
    // the user back on the default tab instead.
    expect(page.url()).toContain(`/record/${code}/device`);

    const body = await page.locator('body').innerText();
    // The tab label must render in the record's tab strip.
    expect(body, 'the Device tab label is not rendered').toContain('Device');
    // And the page must not have fallen through to an error boundary.
    expect(body).not.toContain('Something Went Wrong');
    expect(body).not.toContain('Page Not Found');
  });
});
