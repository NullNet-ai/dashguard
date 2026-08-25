import { expect, test, type Page } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// WP-828 — "Add Global Search". Owner selected option A (Jira comment 14345):
// on the User (contact), Device, Role (user_role) and Device Group grids,
// REPLACE the default search with a custom LIVE search. Each grid still
// searches only its own entity.
//
// SELECTOR NOTES (measured against this codebase, not guessed):
//   * Grid table/row/head test-ids derive from `state.config.entity` and are
//     SINGULAR — `device-grid-table-body`, `user-role-grid-table-body`, and
//     `device-group-settings-grid-table-body` for the device-group grid even
//     though its route is /portal/device_group/grid.
//   * The SEARCH test-ids are different: SearchDialog.tsx builds them from
//     usePathname() (`${path1}-${path2}-...`) via testIDFormatter, which maps
//     `_` -> `-`. So they are PATH-derived, not entity-derived:
//       /portal/device_group/grid -> device-group-grid-search-button
//       /portal/user_role/grid    -> user-role-grid-search-button
//   * The CONTACT grid emits no test-id on rows or cells; assert on rendered
//     text there instead.
//
// Credentials: QA_E2E_EMAIL / QA_E2E_PASSWORD only. Never the hardcoded
// ADMIN_CREDENTIALS in tests/e2e/utils/auth.ts.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

interface GridUnderTest {
  label: string;
  url: string;
  /** usePathname()-derived test-id prefix used by the search components */
  pathPrefix: string;
  /** config.entity-derived test-id prefix used by the table */
  entityPrefix: string | null;
}

const GRIDS: GridUnderTest[] = [
  {
    label: 'User (contact)',
    url: '/portal/contact/grid',
    pathPrefix: 'contact-grid',
    // Contact grid emits no row/cell test-ids.
    entityPrefix: null,
  },
  {
    label: 'Device',
    url: '/portal/device/grid',
    pathPrefix: 'device-grid',
    entityPrefix: 'device-grid',
  },
  {
    label: 'Role (user_role)',
    url: '/portal/user_role/grid',
    pathPrefix: 'user-role-grid',
    entityPrefix: 'user-role-grid',
  },
  {
    label: 'Device Group',
    url: '/portal/device_group/grid',
    pathPrefix: 'device-group-grid',
    // NOTE: entity is device_group_settings, not device_group.
    entityPrefix: 'device-group-settings-grid',
  },
];

const login = async (page: Page) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email!, password!);
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15000,
  });
};

test.describe('WP-828: custom live search replaces the default grid search', () => {
  test.skip(
    !email || !password,
    'QA_E2E_EMAIL / QA_E2E_PASSWORD not set — export them from .env.local',
  );

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const grid of GRIDS) {
    test(`${grid.label}: the default modal search is hidden`, async ({
      page,
    }) => {
      await page.goto(grid.url);
      await page.waitForLoadState('networkidle');

      // The default is a "Search" button that opens a headlessui Dialog.
      // Option A says hide/replace it.
      await expect(
        page.locator(`[data-test-id="${grid.pathPrefix}-search-button"]`),
      ).toHaveCount(0);
    });

    test(`${grid.label}: an inline live search input is present`, async ({
      page,
    }) => {
      await page.goto(grid.url);
      await page.waitForLoadState('networkidle');

      const input = page.locator(
        `[data-test-id="${grid.pathPrefix}-live-search-input"]`,
      );
      await expect(input).toBeVisible();
      // "Search live" — it must be usable without opening a dialog first.
      await expect(input).toBeEditable();
    });

    test(`${grid.label}: typing filters the grid without opening a dialog`, async ({
      page,
    }) => {
      await page.goto(grid.url);
      await page.waitForLoadState('networkidle');

      const input = page.locator(
        `[data-test-id="${grid.pathPrefix}-live-search-input"]`,
      );
      await input.waitFor({ state: 'visible', timeout: 15000 });

      // A string that should match nothing anywhere.
      await input.fill('zzzzqqqqnomatch');
      // Debounce is 500ms in the existing search components; allow margin.
      await page.waitForTimeout(2000);

      // No modal opened.
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);

      if (grid.entityPrefix) {
        const rows = page.locator(
          `[data-test-id^="${grid.entityPrefix}-table-body-row"]`,
        );
        await expect(rows).toHaveCount(0);
      } else {
        // Contact grid: no row test-ids — assert on the empty-state text.
        await expect(page.getByText(/no (records|results|data)/i)).toBeVisible();
      }
    });

    test(`${grid.label}: clearing the live search restores rows`, async ({
      page,
    }) => {
      await page.goto(grid.url);
      await page.waitForLoadState('networkidle');

      const input = page.locator(
        `[data-test-id="${grid.pathPrefix}-live-search-input"]`,
      );
      await input.waitFor({ state: 'visible', timeout: 15000 });

      await input.fill('zzzzqqqqnomatch');
      await page.waitForTimeout(2000);
      await input.fill('');
      await page.waitForTimeout(2000);

      if (grid.entityPrefix) {
        const rows = page.locator(
          `[data-test-id^="${grid.entityPrefix}-table-body-row"]`,
        );
        expect(await rows.count()).toBeGreaterThan(0);
      } else {
        await expect(
          page.getByText(/no (records|results|data)/i),
        ).toHaveCount(0);
      }
    });
  }

  test('a grid outside the ticket scope keeps the default modal search', async ({
    page,
  }) => {
    // Regression guard: ~20 other grids must be untouched. Organization is the
    // representative sample (it already declares searchSuggestionConfig).
    await page.goto('/portal/organization/grid');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-test-id="organization-grid-search-button"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="organization-grid-live-search-input"]'),
    ).toHaveCount(0);
  });
});
