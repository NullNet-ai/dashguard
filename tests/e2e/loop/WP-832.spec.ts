import { expect, test } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// Credentials come from .env.local (`set -a; . ./.env.local; set +a`).
// NEVER use tests/e2e/utils/auth.ts ADMIN_CREDENTIALS — that is a hardcoded
// live production password.
const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;

// Cold Turbopack compiles of a brand-new route are slow.
test.describe.configure({ timeout: 240_000 });

// ---------------------------------------------------------------------------
// SELECTORS — every one below was dumped from the LIVE page before being used.
//
//   user_role grid  : user-role-grid-table-body-row-<id>
//                     user-role-grid-table-body-row-cell-<accessorKey>-<n>
//   record tabs     : <main_entity>-rcrdtab-<tab.name lowercased, spaces->->
//                     measured live: user_role-rcrdtab-dashboard,
//                                    user_role-rcrdtab-role
//                     => the new tab named 'User' is user_role-rcrdtab-user
//                     (TabItems.tsx:94-97 builds this id)
//   contact grid    : contact-grd-tbl, contact-grid-table-head-row-<accessorKey>,
//                     contact-grd-tbl-tbody-row-<id>,
//                     contact-grd-tbl-tbody-row-cell-<accessorKey>-<n>
//                     NOTE: the contact grid DOES emit row + cell test-ids
//                     (measured 2026-08-25 on /portal/contact/grid).
//
// Column ids derive from accessorKey, not header text: 'Role' -> roles,
// 'State' -> status, 'ID' -> code, 'Primary Email' -> email.
// ---------------------------------------------------------------------------

const ROLE_UNDER_TEST = 'Developer';

async function login(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email!, password!);
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
}

/** Discover the record code of an Active role by its displayed role name. */
async function findRoleCode(page: import('@playwright/test').Page, roleName: string) {
  await page.goto('/portal/user_role/grid');
  await page.waitForLoadState('networkidle');
  const rows = page.locator('[data-test-id^="user-role-grid-table-body-row-01"]');
  await expect.poll(() => rows.count(), { timeout: 30_000 }).toBeGreaterThan(0);

  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const row = rows.nth(i);
    const role = (
      await row
        .locator('[data-test-id^="user-role-grid-table-body-row-cell-role-"]')
        .innerText()
        .catch(() => '')
    ).trim();
    if (role === roleName) {
      return (
        await row
          .locator('[data-test-id^="user-role-grid-table-body-row-cell-code-"]')
          .innerText()
      ).trim();
    }
  }
  return '';
}

test.describe('WP-832: Role Record > User - Add User Grid', () => {
  test.beforeEach(async ({ page }) => {
    // Fail LOUDLY on missing env vars — never test.skip().
    expect(
      Boolean(email && password),
      'QA_E2E_EMAIL / QA_E2E_PASSWORD must be exported from .env.local',
    ).toBe(true);
    await login(page);
  });

  test('the role record shows a "User" tab alongside Dashboard and Role', async ({
    page,
  }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code, `no Active role named "${ROLE_UNDER_TEST}" found`).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user_role`);
    await page.waitForLoadState('networkidle');

    // Guard: the two existing tabs are present, so a total miss is not mistaken
    // for a missing User tab.
    await expect(
      page.locator('[data-test-id="user_role-rcrdtab-dashboard"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="user_role-rcrdtab-role"]'),
    ).toBeVisible();

    await expect(
      page.locator('[data-test-id="user_role-rcrdtab-user"]'),
      'a "User" tab must exist on the user_role record',
    ).toBeVisible();
  });

  test('the User tab renders a contact grid of users holding this role', async ({
    page,
  }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-test-id="contact-grd-tbl"]'),
      'the User tab must render the contact grid',
    ).toBeVisible({ timeout: 60_000 });

    // NON-VACUITY GUARD. A Store-rejected entity returns HTTP 200 + an empty
    // array, so "every row holds this role" passes trivially on zero rows.
    // The Developer role has 3 account_organization rows (measured live).
    const rows = page.locator('[data-test-id^="contact-grd-tbl-tbody-row-01"]');
    await expect
      .poll(() => rows.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);
  });

  test('every listed user actually holds this role', async ({ page }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-test-id^="contact-grd-tbl-tbody-row-01"]');
    await expect
      .poll(() => rows.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const roles = (
        await rows
          .nth(i)
          .locator('[data-test-id^="contact-grd-tbl-tbody-row-cell-roles-"]')
          .innerText()
          .catch(() => '')
      ).trim();
      expect(roles, `row ${i} does not hold ${ROLE_UNDER_TEST}`).toContain(
        ROLE_UNDER_TEST,
      );
    }
  });

  test('the grid uses the Users menu columns', async ({ page }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-test-id="contact-grd-tbl"]'),
    ).toBeVisible({ timeout: 60_000 });

    // Column test-ids derive from accessorKey (hyphenated), not header text.
    for (const key of [
      'status',
      'code',
      'roles',
      'first-name',
      'last-name',
      'email',
    ]) {
      await expect(
        page.locator(`[data-test-id="contact-grid-table-head-row-${key}"]`),
        `missing column header '${key}'`,
      ).toBeVisible();
    }
  });

  test('an Add/Assign user control is present', async ({ page }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-test-id="user-role-rcrd-assign-user-btn"]'),
      'the User tab must offer an ADD (assign existing user) control',
    ).toBeVisible({ timeout: 60_000 });
  });

  test('SCOPE GUARD: no remove/unassign control is offered', async ({ page }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: /unassign|remove user/i }),
    ).toHaveCount(0);
  });
});
