import { expect, test, type Locator, type Page } from '@playwright/test';

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
//   * The live-search input test-id matches TWO elements: the desktop toolbar
//     and the `lg:hidden` responsive one (display:none at 1440px). Only one is
//     Playwright-visible, so every interaction locator is filtered to the
//     VISIBLE one — a bare locator is a strict-mode violation.
//   * The CONTACT grid renders rows through DraggableRow, which does not
//     forward the row `data-test-id` to the DOM, so per-row ids exist on the
//     other three grids only. `[data-test-id="<entity>-grid-table-body"] > tr`
//     works on all four and is what these tests count.
//   * `waitForLoadState('networkidle')` never settles on the portal (socket.io
//     holds an open connection), so these tests wait on the element they are
//     about to use instead. That is what made the organization guard time out.
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
  /** config.entity-derived test-id prefix used by the table body */
  tableEntity: string;
}

const GRIDS: GridUnderTest[] = [
  {
    label: 'User (contact)',
    url: '/portal/contact/grid',
    pathPrefix: 'contact-grid',
    tableEntity: 'contact',
  },
  {
    label: 'Device',
    url: '/portal/device/grid',
    pathPrefix: 'device-grid',
    tableEntity: 'device',
  },
  {
    label: 'Role (user_role)',
    url: '/portal/user_role/grid',
    pathPrefix: 'user-role-grid',
    tableEntity: 'user-role',
  },
  {
    label: 'Device Group',
    url: '/portal/device_group/grid',
    pathPrefix: 'device-group-grid',
    // NOTE: entity is device_group_settings, not device_group.
    tableEntity: 'device-group-settings',
  },
];

/** Debounce is 500ms in LiveSearch; allow margin for the refetch. */
const DEBOUNCE_SETTLE = 2500;

const login = async (page: Page) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email!, password!);
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15000,
  });
};

/** The one live-search input that is actually on screen. */
const liveSearchInput = (page: Page, grid: GridUnderTest): Locator =>
  page
    .locator(`[data-test-id="${grid.pathPrefix}-live-search-input"]`)
    .locator('visible=true')
    .first();

/**
 * Data rows, counted by their `code` cell rather than by `> tr`.
 *
 * TableBody.tsx:198 stamps every cell with
 * `<entity>-grid-table-body-row-cell-<columnId>-<n>`, so a `code`-cell
 * prefix match counts exactly the real records: it skips the empty spacer
 * row the device grid renders first (innerText ""), and it will not count
 * a "no records" placeholder row as a search result.
 */
const rows = (page: Page, grid: GridUnderTest): Locator =>
  page.locator(
    `[data-test-id^="${grid.tableEntity}-grid-table-body-row-cell-code-"]`,
  );

/** Land on a grid and wait for its rows, not for a networkidle that never comes. */
const openGrid = async (page: Page, grid: GridUnderTest) => {
  await page.goto(grid.url);
  await liveSearchInput(page, grid).waitFor({
    state: 'visible',
    timeout: 30000,
  });
  await expect
    .poll(async () => rows(page, grid).count(), { timeout: 30000 })
    .toBeGreaterThan(0);
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
      await openGrid(page, grid);

      // The default is a "Search" button that opens a headlessui Dialog.
      // Option A says hide/replace it.
      await expect(
        page.locator(`[data-test-id="${grid.pathPrefix}-search-button"]`),
      ).toHaveCount(0);
    });

    test(`${grid.label}: an inline live search input is present`, async ({
      page,
    }) => {
      await openGrid(page, grid);

      const input = liveSearchInput(page, grid);
      await expect(input).toBeVisible();
      // "Search live" — it must be usable without opening a dialog first.
      await expect(input).toBeEditable();
    });

    // WP-828 REGRESSION GUARD (the gap that let the live search ship broken).
    //
    // The no-match and clear-restores tests below BOTH pass against a search
    // that returns zero rows for every query, which is exactly what shipped on
    // contact and device: `roles` / `device_group_names` are not columns on
    // `contacts`, and `is_device_online` is a boolean that `like` cannot be
    // applied to, so each emitted one bad criteria into the flat OR chain and
    // the Store rejected the WHOLE query.
    //
    // This test takes a value out of the grid's OWN first row and searches for
    // it. A search that can never match anything fails here.
    test(`${grid.label}: a query taken from the grid's own first row returns rows`, async ({
      page,
    }) => {
      await openGrid(page, grid);

      // Take the value straight out of the grid's own first `code` cell, so
      // the term cannot rot as the data changes. `code` is deliberately the
      // source: it is a real column on all four entities AND searchable on
      // all four — unlike Role / Device Group, the very columns this ticket
      // had to mark unsearchable. Formats differ per entity (CO000001 on
      // contact, CTR6 on user_role), so read the value, never pattern-match it.
      const knownValue = (await rows(page, grid).first().innerText()).trim();
      expect(
        knownValue,
        `first row of ${grid.label} has an empty code cell`,
      ).not.toEqual('');

      const input = liveSearchInput(page, grid);
      await input.fill(knownValue);
      await page.waitForTimeout(DEBOUNCE_SETTLE);

      await expect
        .poll(async () => rows(page, grid).count(), { timeout: 15000 })
        .toBeGreaterThan(0);
    });

    test(`${grid.label}: typing filters the grid without opening a dialog`, async ({
      page,
    }) => {
      await openGrid(page, grid);

      const input = liveSearchInput(page, grid);

      // A string that should match nothing anywhere.
      await input.fill('zzzzqqqqnomatch');
      await page.waitForTimeout(DEBOUNCE_SETTLE);

      // No modal opened.
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);

      await expect
        .poll(async () => rows(page, grid).count(), { timeout: 15000 })
        .toBe(0);
    });

    test(`${grid.label}: clearing the live search restores rows`, async ({
      page,
    }) => {
      await openGrid(page, grid);

      const input = liveSearchInput(page, grid);

      await input.fill('zzzzqqqqnomatch');
      await page.waitForTimeout(DEBOUNCE_SETTLE);
      await input.fill('');
      await page.waitForTimeout(DEBOUNCE_SETTLE);

      await expect
        .poll(async () => rows(page, grid).count(), { timeout: 15000 })
        .toBeGreaterThan(0);
    });
  }

  test('a grid outside the ticket scope keeps the default modal search', async ({
    page,
  }) => {
    // The organization grid is the heaviest of these pages to cold-compile
    // under `next dev --turbopack`; it timed out at the 30s default. Triples
    // the budget rather than shortening the assertions.
    test.slow();

    // Regression guard: ~20 other grids must be untouched. Organization is the
    // representative sample (it already declares searchSuggestionConfig).
    await page.goto('/portal/organization/grid');

    // Same two-element responsive toolbar as the live-search input: the
    // `lg:hidden` copy is in the DOM at 1440px, so a bare locator is a
    // strict-mode violation. Assert on the one that is actually on screen.
    await expect(
      page
        .locator('[data-test-id="organization-grid-search-button"]')
        .locator('visible=true')
        .first(),
    ).toBeVisible({ timeout: 30000 });
    await expect(
      page.locator('[data-test-id="organization-grid-live-search-input"]'),
    ).toHaveCount(0);
  });
});
