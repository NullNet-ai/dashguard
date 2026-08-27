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
// SELECTORS — dumped from the LIVE production page on 2026-08-26 at 1680x1000
// on /portal/user_role/record/<code>/user (see DC000730). The previous version
// of this comment claimed ids that do NOT exist; these are measured.
//
//   user_role grid   : user-role-grid-table-body-row-<id>
//                      user-role-grid-table-body-row-cell-<accessorKey>-<n>
//   record tabs      : <main_entity>-rcrdtab-<tab.name lowercased>
//                      user_role-rcrdtab-dashboard / -role / -user
//                      (TabItems.tsx:94-98 concatenates entityName RAW — the
//                       UNDERSCORE is preserved, there is no testIDFormatter)
//
//   ⚠️ TWO id conventions coexist on this ONE page:
//     * the <table> id comes from the URL PATHNAME segment
//       (GridDesktopContainer.tsx:24 -> path.split('/')[2] -> testIDFormatter),
//       so on /portal/user_role/... it is `user-role-grd-tbl`.
//       `contact-grd-tbl` DOES NOT EXIST here.
//     * row/cell/head ids come from config.entity ('contact'), so they are
//       `contact-grid-table-body-row-<id><n>`   (TableBody.tsx:133 — note
//       `row.id + (index+1)` is STRING CONCATENATION, so prefix-matching on
//       `contact-grid-table-body-row-01` is the correct idiom)
//       `contact-grid-table-body-row-cell-<colId>-<n>`  (TableBody.tsx:147,199)
//       `contact-grid-table-head-row-<hyphenated-accessorKey>` (TableHead.tsx:47)
//     * `contact-grd-tbl-tbody-row-*` belongs to the SubGrid/GridGroupRows and
//       common/DraggableRow paths only — NOT to this grid.
//
// Column ids derive from accessorKey, not header text: 'Role' -> roles,
// 'State' -> status, 'ID' -> code, 'Primary Email' -> email. All of
// status/code/roles/first-name/last-name/email were confirmed PRESENT live
// (columnsOrder from the server-side grid cache overrides the narrower
// defaultShownColumns in client.tsx).
//
// Run with --workers=1: six simultaneous production logins time out.
//
// 🔒 PRODUCTION SAFETY — BINDING (DC000730 §5).
// `account_organizations.role_id` is single-valued AND required, so every
// assignment is ALSO a revocation. This spec runs against PRODUCTION with a
// real account. It must therefore NEVER click
// `user-role-rcrd-assign-user-confirm-btn`, under any condition, at any
// viewport, behind no flag and no env guard. Assertions on that button are
// limited to existence / visibility / hit-testability —
// `document.elementFromPoint` is pure measurement and dispatches no events.
// The furthest this spec may travel is the confirm step, from which it retreats
// via Back or Escape. `user-role-rcrd-assign-user-save-btn` IS safe to click:
// it only sets local `isConfirming` state (UserPicker.tsx:116-124).
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
      page.locator('[data-test-id="user-role-grd-tbl"]'),
      'the User tab must render the grid table',
    ).toBeVisible({ timeout: 60_000 });

    // NON-VACUITY GUARD. A Store-rejected entity returns HTTP 200 + an empty
    // array, so "every row holds this role" passes trivially on zero rows.
    // The Developer role has 3 account_organization rows (measured live).
    const rows = page.locator('[data-test-id^="contact-grid-table-body-row-01"]');
    await expect
      .poll(() => rows.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);
  });

  test('every listed user actually holds this role', async ({ page }) => {
    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-test-id^="contact-grid-table-body-row-01"]');
    await expect
      .poll(() => rows.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);

    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const roles = (
        await rows
          .nth(i)
          .locator('[data-test-id^="contact-grid-table-body-row-cell-roles-"]')
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
      page.locator('[data-test-id="user-role-grd-tbl"]'),
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

  // -------------------------------------------------------------------------
  // WP-832 QA-FIX regression tests (DC000730 §4.2).
  //
  // 🔒 Neither test below clicks `user-role-rcrd-assign-user-confirm-btn`, and
  // neither ever may: confirming REVOKES a real person's role in production.
  // -------------------------------------------------------------------------

  // The defect's actual surface is DESKTOP: Grid/index.tsx:68 branches on
  // isDesktop and only the desktop branch wraps the pagination bar in
  // `sticky z-50`. All three widths below measured 0/60 self-hits against the
  // shipped build on 2026-08-27, naming `contact-grd-pagination-page1-btn` as
  // the interceptor — i.e. they are RED for exactly the right reason.
  //
  // 390x844 is deliberately NOT in this list. DC000730 AC2 predicted 30/30
  // there, but that does NOT reproduce and the plan's figure came from a probe
  // this lane could not re-verify. Measured live on 2026-08-27:
  //   * the drawer cannot be opened from a mobile viewport at all — the Assign
  //     control is Grid's `customCreateButton` (client.tsx:139-153), which the
  //     mobile grid never renders;
  //   * forcing it open at desktop width and then resizing to 390 still yields
  //     0/60, with the footer's own container as the reported interceptor.
  // Both are separate from this stacking defect, and neither can be settled
  // against production, which serves the pre-fix build. Asserting a mobile
  // expectation here would either gate the fix on an unrelated failure or, if
  // written to pass, be a test that is green on a broken feature. Left out and
  // reported instead — see the WP-832 report / DC000730 implementation log.
  const VIEWPORTS = [
    { width: 1600, height: 900 },
    { width: 1680, height: 1000 },
    { width: 1920, height: 1080 },
  ];

  for (const vp of VIEWPORTS) {
    test(`the drawer footer button is HIT-TESTABLE, not merely visible, at ${vp.width}x${vp.height}`, async ({
      page,
    }) => {
      // NAVIGATE AND OPEN AT A DESKTOP WIDTH, THEN RESIZE TO THE TARGET.
      // Two independent reasons, BOTH measured live on 2026-08-27 rather than
      // assumed — the first draft of this test set the viewport up front and
      // failed at 390x844 for these reasons, never reaching the hit-test:
      //
      //  1. findRoleCode() reads `user-role-grid-table-body-row-*`, which only
      //     the DESKTOP grid emits. Grid/index.tsx:68 branches on isDesktop and
      //     GridMobile renders cards with no such row ids, so at 390px it polls
      //     0 rows until timeout ("Expected: > 0 / Received: 0").
      //  2. The Assign control is passed to Grid as `customCreateButton`
      //     (client.tsx:139-153), which the MOBILE grid does not render at all.
      //     At 390px `user-role-rcrd-assign-user-btn` is absent from the DOM, so
      //     the drawer cannot be opened from a mobile viewport in the first
      //     place. That is a separate product gap (no mobile Assign affordance),
      //     NOT this QA-fix's stacking defect, and is deliberately not "fixed"
      //     here — adding a mobile affordance would be new scope.
      //
      // NOTE: every viewport in VIEWPORTS is a DESKTOP width, so the resize
      // below is a no-op width change rather than a branch change. The mobile
      // resize path described above was removed along with 390x844 -- it is
      // documented here only because it is why the open-then-resize ordering
      // exists at all.
      await page.setViewportSize({ width: 1680, height: 1000 });

      const code = await findRoleCode(page, ROLE_UNDER_TEST);
      expect(code).not.toBe('');

      await page.goto(`/portal/user_role/record/${code}/user`);
      await page.waitForLoadState('networkidle');

      // Safe: opens the drawer. No mutation.
      await page
        .locator('[data-test-id="user-role-rcrd-assign-user-btn"]')
        .click();

      const saveBtn = page.locator(
        '[data-test-id="user-role-rcrd-assign-user-save-btn"]',
      );
      await expect(saveBtn).toBeVisible({ timeout: 60_000 });

      // Now switch to the viewport under test and let the branch re-render.
      await page.setViewportSize(vp);
      await expect(saveBtn).toBeVisible({ timeout: 60_000 });
      // The picker grid fetches after mount; let it settle before measuring.
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(4_000);

      // toBeVisible() CANNOT catch this defect — the button is visible, just
      // covered. document.elementFromPoint is pure measurement: it dispatches
      // no events, so this is safe against production.
      const probe = await saveBtn.evaluate((btn) => {
        const b = btn.getBoundingClientRect();
        let self = 0;
        let total = 0;
        const blockers = new Set<string>();

        for (let x = b.left + 3; x <= b.right - 3; x += 12) {
          for (let y = b.top + 3; y <= b.bottom - 3; y += 8) {
            total++;
            const hit = document.elementFromPoint(x, y);
            if (hit && (hit === btn || btn.contains(hit))) {
              self++;
            } else if (hit) {
              const el = hit as HTMLElement;
              blockers.add(
                el.dataset.testId ??
                  `${el.tagName}.${String(el.className).slice(0, 60)}`,
              );
            }
          }
        }

        return { self, total, blockers: [...blockers] };
      });

      expect(probe.total, 'the hit-test sampled no points').toBeGreaterThan(0);
      expect(
        probe.self,
        `"Review & replace" is covered at ${vp.width}x${vp.height}: only ` +
          `${probe.self}/${probe.total} sampled points reach the button. ` +
          `Interceptors: ${probe.blockers.join(', ') || '(none recorded)'}`,
      ).toBe(probe.total);

      // Retreat. Never proceed past the footer button.
      await page.keyboard.press('Escape');
    });
  }

  test('AC3: the drawer pagination bar stays usable after the footer is raised', async ({
    page,
  }) => {
    // Guards against "fixed by covering the other thing": raising the footer's
    // z-index must not simply hide the pagination bar underneath it.
    await page.setViewportSize({ width: 1680, height: 1000 });

    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    await page.locator('[data-test-id="user-role-rcrd-assign-user-btn"]').click();
    await expect(
      page.locator('[data-test-id="user-role-rcrd-assign-user-save-btn"]'),
    ).toBeVisible({ timeout: 60_000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4_000);

    // The picker grid is the `contact`-entity grid inside the drawer; its
    // pagination bar was the measured interceptor of the footer button.
    const pageBtn = page
      .locator('[data-test-id="contact-grd-pagination-page1-btn"]')
      .first();
    await expect(pageBtn).toBeVisible({ timeout: 30_000 });

    const probe = await pageBtn.evaluate((btn) => {
      const b = btn.getBoundingClientRect();
      let self = 0;
      let total = 0;
      const blockers = new Set<string>();

      for (let x = b.left + 2; x <= b.right - 2; x += 6) {
        for (let y = b.top + 2; y <= b.bottom - 2; y += 6) {
          total++;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === btn || btn.contains(hit))) self++;
          else if (hit) {
            const el = hit as HTMLElement;
            blockers.add(
              el.dataset.testId ??
                `${el.tagName}.${String(el.className).slice(0, 60)}`,
            );
          }
        }
      }

      return { self, total, blockers: [...blockers] };
    });

    expect(probe.total).toBeGreaterThan(0);
    expect(
      probe.self,
      `the drawer pagination bar is itself covered (${probe.self}/${probe.total}). ` +
        `Interceptors: ${probe.blockers.join(', ') || '(none recorded)'}`,
    ).toBe(probe.total);

    await page.keyboard.press('Escape');
  });

  test('SAFETY: reaching the confirm step writes nothing', async ({ page }) => {
    // Instrument fetch BEFORE navigation so every request is recorded. This is
    // a mechanical backstop for the §5 safety property — it does not rest on
    // the author's discipline.
    await page.addInitScript(() => {
      (window as any).__wp832Calls = [];
      const orig = window.fetch;
      window.fetch = ((...args: any[]) => {
        try {
          const req = args[0];
          const url = typeof req === 'string' ? req : req?.url;
          const method = (
            args[1]?.method ??
            (typeof req === 'object' ? req?.method : undefined) ??
            'GET'
          ).toUpperCase();
          (window as any).__wp832Calls.push(`${method} ${url}`);
        } catch {
          /* never let instrumentation break the page */
        }
        return orig.apply(window, args as any);
      }) as typeof window.fetch;
    });

    await page.setViewportSize({ width: 1680, height: 1000 });

    const code = await findRoleCode(page, ROLE_UNDER_TEST);
    expect(code).not.toBe('');

    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');

    const holderRows = page.locator(
      '[data-test-id^="contact-grid-table-body-row-01"]',
    );
    // NON-VACUITY GUARD — a Store-rejected query returns HTTP 200 + [], so an
    // "unchanged count" of zero would be trivially true.
    await expect
      .poll(() => holderRows.count(), { timeout: 60_000 })
      .toBeGreaterThan(0);
    const holdersBefore = await holderRows.count();

    await page.locator('[data-test-id="user-role-rcrd-assign-user-btn"]').click();

    // AC5: the amber replacement warning renders with 0 rows selected.
    await expect(
      page.locator('[data-test-id="user-role-rcrd-assign-user-warning"]'),
    ).toBeVisible({ timeout: 60_000 });

    const saveBtn = page.locator(
      '[data-test-id="user-role-rcrd-assign-user-save-btn"]',
    );
    await expect(saveBtn).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4_000);

    // Select exactly one row inside the drawer. Scoped to the picker via the
    // warning banner's parent so it cannot pick the holders grid behind it.
    const picker = page
      .locator('[data-test-id="user-role-rcrd-assign-user-warning"]')
      .locator('xpath=..');
    const checkboxes = picker.getByRole('checkbox');
    await expect
      .poll(() => checkboxes.count(), { timeout: 60_000 })
      .toBeGreaterThan(1);
    // index 0 is the header select-all; take the first data row.
    await checkboxes.nth(1).click();

    // SAFE to click: this only flips local `isConfirming` state
    // (UserPicker.tsx:116-124). It writes nothing.
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // AC6: the confirm step renders the per-user disclosure.
    await expect(
      page.locator('[data-test-id="user-role-rcrd-assign-user-confirm"]'),
    ).toBeVisible({ timeout: 30_000 });
    const confirmRows = page.locator(
      '[data-test-id="user-role-rcrd-assign-user-confirm-row"]',
    );
    await expect
      .poll(() => confirmRows.count(), { timeout: 30_000 })
      .toBeGreaterThan(0);

    // 🔒 The confirm button is asserted PRESENT and HIT-TESTABLE ONLY.
    // Clicking it would revoke a real person's role in production. NEVER click.
    const confirmBtn = page.locator(
      '[data-test-id="user-role-rcrd-assign-user-confirm-btn"]',
    );
    await expect(confirmBtn).toBeVisible();

    const probe = await confirmBtn.evaluate((btn) => {
      const b = btn.getBoundingClientRect();
      let self = 0;
      let total = 0;
      const blockers = new Set<string>();

      for (let x = b.left + 3; x <= b.right - 3; x += 12) {
        for (let y = b.top + 3; y <= b.bottom - 3; y += 8) {
          total++;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === btn || btn.contains(hit))) self++;
          else if (hit) {
            const el = hit as HTMLElement;
            blockers.add(
              el.dataset.testId ??
                `${el.tagName}.${String(el.className).slice(0, 60)}`,
            );
          }
        }
      }

      return { self, total, blockers: [...blockers] };
    });

    expect(probe.total).toBeGreaterThan(0);
    expect(
      probe.self,
      `the confirm button is covered (${probe.self}/${probe.total}). ` +
        `Interceptors: ${probe.blockers.join(', ') || '(none recorded)'}`,
    ).toBe(probe.total);

    // Retreat via Back, then close the drawer. No mutation is ever completed.
    //
    // Scoped to the confirm view on purpose. `SideDrawerView.tsx:348` renders
    // aria-label={canGoBack ? 'Back' : 'Close side drawer'}, so an unscoped
    // getByRole('button', { name: 'Back' }) matches TWO elements whenever the
    // drawer was reached via a push (canGoBack === true) and trips Playwright
    // strict mode. Neither match is the confirm button, so this is a locator
    // trap rather than a safety one -- but it is this loop's recurring trap.
    await page
      .locator('[data-test-id="user-role-rcrd-assign-user-confirm"]')
      .getByRole('button', { name: 'Back' })
      .click();
    await expect(saveBtn).toBeVisible({ timeout: 30_000 });
    await page.keyboard.press('Escape');

    // AC9a: zero mutating network calls were observed.
    const calls: string[] = await page.evaluate(
      () => (window as any).__wp832Calls ?? [],
    );
    const mutating = calls.filter((c) => {
      const method = c.split(' ')[0] ?? '';
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return false;
      // tRPC batches queries over POST; only the assign mutation is a write.
      return /assignUsers/i.test(c);
    });
    expect(
      mutating,
      `the spec must complete NO role mutation; observed: ${mutating.join(', ')}`,
    ).toEqual([]);

    // AC9b: the holder count on the User tab is unchanged.
    await page.goto(`/portal/user_role/record/${code}/user`);
    await page.waitForLoadState('networkidle');
    await expect
      .poll(() => holderRows.count(), { timeout: 60_000 })
      .toBe(holdersBefore);
  });
});
