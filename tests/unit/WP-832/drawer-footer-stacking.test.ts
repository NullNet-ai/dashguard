import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// WP-832 QA-FIX (DC000730 §4.1) — the production defect was CSS stacking:
//
//   src/components/platform/Grid/views/GridDesktop.tsx wraps the pagination bar
//   in `sticky z-50`. The UserPicker drawer footers are `absolute inset-x-0
//   bottom-8` with NO z-index, i.e. `z-index: auto`, which loses to z-50
//   regardless of DOM order. The "Review & replace" button was therefore
//   VISIBLE but not HIT-TESTABLE at every desktop width (0/30 self-hits at
//   1600x900 / 1680x1000 / 1920x1080). Mobile is NOT a control: the Assign
//   button is Grid's `customCreateButton`, which only the DESKTOP grid renders,
//   so at 390x844 the drawer cannot be opened and there is nothing to hit-test.
//
// jsdom cannot lay out stacking contexts, so these tests guard the INVARIANT
// against real source text rather than rendering: the drawer footer's z-index
// must strictly exceed the platform pagination wrapper's, and the platform
// grid must not be edited to get there.
//
// ⚠️ SAFETY NOTE for future editors: `user-role-rcrd-assign-user-confirm-btn`
// must NEVER be clicked by an automated test. `account_organizations.role_id`
// is single-valued and required, so confirming REVOKES a real person's role in
// production. See DC000730 §5.

const ROOT = join(__dirname, '../../..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const GRID_DESKTOP = 'src/components/platform/Grid/views/GridDesktop.tsx';
const GRID_SCROLLVIEW = 'src/components/platform/Grid/common/GridScrollview.tsx';
const PICKER =
  'src/app/portal/(settings)/user_role/_components/forms/user-details/UserPicker.tsx';
const CLIENT =
  'src/app/portal/(settings)/user_role/_components/forms/user-details/client.tsx';

/** The commit the WP-832 feature shipped in (`main-2468`). */
const SHIPPED_SHA = '51547489';

/** Read a `z-<n>` / `z-[<n>]` tailwind class out of a className string. */
function zIndexOf(className: string): number | null {
  const bracket = /(?:^|\s)z-\[(\d+)\]/.exec(className);
  if (bracket?.[1]) return Number(bracket[1]);

  const bare = /(?:^|\s)z-(\d+)(?:\s|$)/.exec(className);
  if (bare?.[1]) return Number(bare[1]);

  return null;
}

/**
 * The platform pagination wrapper's z-index, read from live source.
 * This is the number the whole fix is calibrated against.
 */
function paginationZIndex(): number {
  const src = read(GRID_DESKTOP);
  const match = /sticky\s+z-\[?(\d+)\]?/.exec(src);

  expect(
    match,
    `${GRID_DESKTOP} no longer declares a \`sticky z-<n>\` pagination wrapper — ` +
      'the WP-832 drawer-footer fix was calibrated against it, so re-measure.',
  ).not.toBeNull();

  return Number(match![1]);
}

describe('WP-832 QA-fix: pagination z-index contract', () => {
  it('the platform pagination wrapper is exactly z-50', () => {
    // Documents the constant this fix depends on. If the platform ever changes
    // it, this fails loudly instead of the drawer silently regressing.
    expect(paginationZIndex()).toBe(50);
  });
});

describe('WP-832 QA-fix: drawer footer outranks the pagination bar', () => {
  it('every absolutely-positioned drawer footer declares z-index > pagination', () => {
    const paginationZ = paginationZIndex();
    const picker = read(PICKER);

    // Both footers (picker step :270 and confirm step :208) are
    // `absolute inset-x-0 bottom-<n>` overlays sitting over the grid.
    const footers = [
      ...picker.matchAll(/className="([^"]*absolute inset-x-0 bottom-[^"]*)"/g),
    ].map((m) => m[1] ?? '');

    // NON-VACUITY GUARD: there are two such footers. Without this count
    // assertion the test would pass by matching none.
    expect(
      footers.length,
      'expected BOTH UserPicker footers (picker + confirm) to be found; ' +
        `matched ${footers.length}`,
    ).toBeGreaterThanOrEqual(2);

    for (const className of footers) {
      const z = zIndexOf(className);

      expect(
        z,
        `a drawer footer declares no z-index (z-index: auto loses to ` +
          `z-${paginationZ}): "${className}"`,
      ).not.toBeNull();

      expect(
        z!,
        `drawer footer z-${z} does not outrank the pagination bar's ` +
          `z-${paginationZ}: "${className}"`,
      ).toBeGreaterThan(paginationZ);
    }
  });

  it('reserves enough space below the grid that the footer does not cover the pagination bar', () => {
    const picker = read(PICKER);

    // The footer overlay's vertical extent, measured from the box model:
    //   bottom-8 offset (32px) + border-t (1px) + py-4 (16+16px)
    //   + Button size=default h-[34px] (src/components/ui/button.tsx:39)
    //   = 99px
    // The container must reserve at least that much, or raising the z-index
    // merely swaps "button unclickable" for "pagination bar unclickable".
    const FOOTER_EXTENT_PX = 99;

    const roots = [
      ...picker.matchAll(/className="([^"]*\bpb-(\[?\d+\]?|\d+)[^"]*)"/g),
    ]
      .map((m) => m[1] ?? '')
      .filter((c) => c.includes('h-full') && c.includes('flex-col'));

    expect(
      roots.length,
      'expected BOTH UserPicker step containers (picker + confirm) to reserve ' +
        `bottom padding for the footer overlay; matched ${roots.length}`,
    ).toBeGreaterThanOrEqual(2);

    for (const className of roots) {
      const bracket = /(?:^|\s)pb-\[(\d+)px\]/.exec(className);
      const bare = /(?:^|\s)pb-(\d+)(?:\s|$)/.exec(className);
      const px = bracket?.[1]
        ? Number(bracket[1])
        : bare?.[1]
          ? Number(bare[1]) * 4 // tailwind spacing unit = 0.25rem = 4px
          : null;

      expect(px, `could not read bottom padding from "${className}"`).not.toBeNull();
      expect(
        px!,
        `bottom padding ${px}px does not clear the ${FOOTER_EXTENT_PX}px footer ` +
          `overlay: "${className}"`,
      ).toBeGreaterThanOrEqual(FOOTER_EXTENT_PX);
    }
  });
});

describe('WP-832 QA-fix: scope guard — the shared Grid platform is untouched', () => {
  // Lowering `z-50` at GridDesktop.tsx would change stacking order for ~20
  // grids repo-wide. DC000730 §3.1 forbids it; this encodes that mechanically.
  for (const path of [GRID_DESKTOP, GRID_SCROLLVIEW]) {
    it(`${path} is byte-identical to ${SHIPPED_SHA}`, () => {
      const shipped = execFileSync('git', ['show', `${SHIPPED_SHA}:${path}`], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024,
      });

      expect(
        read(path),
        `${path} was modified. The WP-832 QA fix must raise the DRAWER footer ` +
          'above the platform pagination, never lower the platform pagination ' +
          '(shared by ~20 grids). See DC000730 §3.1.',
      ).toBe(shipped);
    });
  }
});

describe('WP-832 QA-fix: remove/unassign stays out of scope', () => {
  it('neither the picker nor the User tab client offers an unassign mutation', () => {
    // Owner decision, Jira comment 14340: ADD only.
    for (const path of [PICKER, CLIENT]) {
      const src = read(path);

      expect(
        /unassign|removeUser|revokeRole|unassignUsers/i.test(src),
        `${path} appears to offer a remove/unassign path, which is out of scope`,
      ).toBe(false);
    }
  });
});
