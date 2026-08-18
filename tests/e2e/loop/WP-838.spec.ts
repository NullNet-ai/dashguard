import { expect, test, type Page } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// WP-838 — Device Group Wizard > Step 1 (Basic Details): clicking "Show Grid"
// must list ONLY Draft records.
//
// Requirement inferred from sibling ticket WP-837 (Role Wizard, identical
// wording), clarified by the owner as: "when clicking 'Show Grid', the list of
// items, filter show Draft only."
//
// PRE-REQUISITE (owner's instruction: "Add in your test case pre-requisite,
// create Draft. Just fill out Step 1 Forms"): the environment normally holds
// ZERO Draft device groups, so an "every row is Draft" assertion over an empty
// grid passes vacuously — a completely dead filter would pass it too. Each test
// therefore first creates its own Draft by filling out wizard Step 1 (an
// incomplete wizard leaves a Draft record behind), and the grid assertions are
// guarded by a mandatory non-empty check plus a check that the record we just
// created is actually listed.
//
// TOUCHES REAL DATA — runs against localhost pre-merge and PRODUCTION
// post-deploy — so every device group this spec creates is deleted in
// afterEach, and the deletion (a soft-archive) is verified by re-querying.
//
// No record code is hardcoded: the wizard is entered at /wizard/new/1, which is
// the same entry point the grid's "New" button uses.

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;
const runId = process.env.QA_RUN_ID ?? `${process.pid}`;

// Sub-grid inside the form filter renders with the filter_entity as its prefix
// (src/components/platform/Grid/TableBody.tsx:98 + testIDFormatter).
const TABLE_BODY = '[data-test-id="device-group-settings-grid-table-body"]';
const STATUS_CELL =
  '[data-test-id^="device-group-settings-grid-table-body-row-cell-status-"]';

async function trpcQuery(page: Page, path: string, input: unknown) {
  const encoded = encodeURIComponent(JSON.stringify({ '0': { json: input } }));
  return page.evaluate(
    async ({ path, encoded }) => {
      const res = await fetch(`/api/trpc/${path}?batch=1&input=${encoded}`);
      return res.json();
    },
    { path, encoded },
  );
}

async function trpcMutate(page: Page, path: string, input: unknown) {
  return page.evaluate(
    async ({ path, input }) => {
      const res = await fetch(`/api/trpc/${path}?batch=1`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ '0': { json: input } }),
      });
      return res.json();
    },
    { path, input },
  );
}

async function findByName(page: Page, name: string) {
  const res = (await trpcQuery(page, 'deviceGroup.mainGrid', {
    current: 1,
    limit: 10,
    pluck: ['id', 'name', 'status'],
    sorting: [],
    advance_filters: [
      { type: 'criteria', field: 'name', operator: 'equal', values: [name] },
    ],
    group_advance_filters: [],
    grouping: [],
    entity: 'device_group_settings',
  })) as any;
  return (res?.[0]?.result?.data?.json?.items ?? []) as Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

// "Delete" here is a soft-archive (status: 'Archived', tombstone: 1) and an
// archived record drops out of mainGrid entirely. There is real read-after-write
// lag of ~1-5s, so cleanup verification retries before calling a record an
// orphan (same approach as tests/e2e/loop/cleanup-rehearsal.spec.ts).
async function waitUntilGone(page: Page, name: string, attempts = 5, delayMs = 1000) {
  let rows = await findByName(page, name);
  for (let i = 0; i < attempts && rows.length > 0; i++) {
    await page.waitForTimeout(delayMs);
    rows = await findByName(page, name);
  }
  return rows;
}

test.describe('WP-838 — Device Group wizard step 1 "Show Grid" is Draft-only', () => {
  // Turbopack compiles the wizard route on first hit; login + cold compile plus
  // the draft-creation prerequisite easily exceeds Playwright's default 30s.
  test.describe.configure({ timeout: 180_000 });

  test.skip(
    !email || !password,
    'QA_E2E_EMAIL / QA_E2E_PASSWORD not set — export them from .env.local',
  );

  // Name of the Draft device group created as this test's prerequisite.
  let draftName: string | undefined;

  /**
   * Prerequisite: fill out wizard Step 1 and advance once. Saving Step 1 creates
   * the record in Draft status (the wizard is only completed at Confirmation),
   * which is exactly the fixture the "Show Grid" assertions need.
   */
  async function createDraftViaStepOne(page: Page) {
    await page.goto('/portal/device_group/wizard/new/1');
    await page.waitForLoadState('networkidle');

    const name = `qa-wp838-${runId}-${Date.now()}`;
    await page.getByLabel('Device Group', { exact: true }).first().fill(name);
    await page.locator('[data-test-id$="wizard-next-button"]').first().click();

    // Step 1 creates the draft; the URL picks up the new record code.
    await page.waitForURL(/\/portal\/device_group\/wizard\/(?!new)[^/]+\/2$/, {
      timeout: 30_000,
    });
    draftName = name;
    await page.waitForLoadState('networkidle');

    const rows = await findByName(page, name);
    expect(rows.length, 'prerequisite draft was not created').toBe(1);
    expect(rows[0]?.status, 'prerequisite record must be a Draft').toBe('Draft');

    return name;
  }

  /** Re-enters a fresh wizard and reveals the form-filter grid. */
  async function openShowGrid(page: Page) {
    await page.goto('/portal/device_group/wizard/new/1');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Show Grid' }).first().click();

    const tableBody = page.locator(TABLE_BODY).first();
    await expect(tableBody).toBeVisible({ timeout: 30_000 });
    return tableBody;
  }

  test.beforeEach(async ({ page }) => {
    draftName = undefined;
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email!, password!);
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 30_000,
    });

    await createDraftViaStepOne(page);
  });

  test.afterEach(async ({ page }) => {
    if (!draftName) return;
    const rows = await findByName(page, draftName);
    for (const row of rows) {
      await trpcMutate(page, 'deviceGroup.delete', { id: row.id });
    }
    const leftover = await waitUntilGone(page, draftName);
    expect(
      leftover.length,
      `cleanup failed — "${draftName}" is still listed after delete`,
    ).toBe(0);
  });

  test('the "Show Grid" control exists on Basic Details', async ({ page }) => {
    await page.goto('/portal/device_group/wizard/new/1');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: 'Show Grid' }).first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('the grid is non-empty and every row has status Draft', async ({ page }) => {
    const tableBody = await openShowGrid(page);

    const statusCells = tableBody.locator(STATUS_CELL);
    // Mandatory guard: without rows, "all rows are Draft" is vacuously true and
    // a dead filter would pass. The prerequisite draft must be among them.
    await expect
      .poll(async () => await statusCells.count(), { timeout: 30_000 })
      .toBeGreaterThan(0);
    await expect(
      tableBody.getByText(draftName!, { exact: true }),
      'the Draft created by the prerequisite must be listed',
    ).toHaveCount(1);

    const statuses = (await statusCells.allInnerTexts()).map((s) => s.trim());
    expect(statuses.length, 'grid should render at least one row').toBeGreaterThan(0);
    for (const status of statuses) {
      expect(status, `unexpected non-Draft row status "${status}"`).toBe('Draft');
    }
  });

  test('no Active or Archived record is listed', async ({ page }) => {
    const tableBody = await openShowGrid(page);

    const statusCells = tableBody.locator(STATUS_CELL);
    await expect
      .poll(async () => await statusCells.count(), { timeout: 30_000 })
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
    await expect(tableBody).toBeVisible({ timeout: 30_000 });

    const statuses = (
      await tableBody.locator(STATUS_CELL).allInnerTexts()
    ).map((s) => s.trim());
    expect(statuses.length).toBeGreaterThan(0);
    // At least one non-Draft row proves the main grid was not narrowed.
    expect(statuses.some((s) => s !== 'Draft')).toBe(true);
  });
});
