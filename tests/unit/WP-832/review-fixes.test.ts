import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '../../..');
const ROUTER = 'src/server/api/routers/user_role.ts';
const PICKER =
  'src/app/portal/(settings)/user_role/_components/forms/user-details/UserPicker.tsx';

const router = readFileSync(join(ROOT, ROUTER), 'utf8');
const picker = readFileSync(join(ROOT, PICKER), 'utf8');

const slice = (src: string, marker: string, length = 3000) => {
  const i = src.indexOf(marker);
  expect(i, `marker '${marker}' not found`).toBeGreaterThan(-1);
  return src.slice(i, i + length);
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKER 2 — cross-org overreach.
//
// account_organizations rows are PER ORGANIZATION. A contact belonging to
// several orgs has a role_id in each, so a lookup keyed on contact_id alone
// rewrites their role in ALL of them. Every read and the write must be scoped to
// the caller's current organization.
// ─────────────────────────────────────────────────────────────────────────────
describe('WP-832 review fix: account_organizations access is org-scoped', () => {
  it('resolves the current organization from the session (the auth.ts idiom)', () => {
    expect(router).toContain('ctx?.session?.account?.organization_id');
  });

  it('refuses to run when the session carries no current organization', () => {
    const scoped = slice(router, 'const currentOrganizationId', 800);
    expect(scoped).toMatch(/throw new TRPCError/);
    expect(scoped).toContain('UNAUTHORIZED');
  });

  it('plucks organization_id everywhere account_organizations is queried', () => {
    // Only the two findAll LOOKUPS (a query pluck is followed by `order:`);
    // the update()'s response pluck is not a filter surface.
    const plucks =
      router.match(/pluck: \[[^\]]*'contact_id'[^\]]*\],\s*\n\s*order:/g) ?? [];
    expect(plucks.length, 'expected both account_organizations lookups').toBe(2);
    for (const pluck of plucks) {
      expect(pluck, `pluck missing organization_id: ${pluck}`).toContain(
        'organization_id',
      );
    }
  });

  it('filters the role-holder lookup down to the caller org', () => {
    const scoped = slice(router, 'const fetchAccountOrganizations');
    expect(scoped).toMatch(/return scopeToOrganization\(/);
  });

  it('filters the assignUsers write set down to the caller org', () => {
    const scoped = slice(router, 'assignUsers:');
    expect(scoped).toContain('currentOrganizationId(ctx)');
    expect(
      scoped,
      'the ids handed to .update() must come from the org-scoped set',
    ).toMatch(/account_organization_ids = scopeToOrganization\(/);
  });

  it('compares organization_id by equality, not merely presence', () => {
    const scoped = slice(router, 'const scopeToOrganization', 600);
    expect(scoped).toMatch(
      /readRowField\(row, 'organization_id'\) === organization_id/,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKER 1 — undisclosed role replacement.
//
// role_id is single-valued and required, so an assignment is a REPLACEMENT. The
// operator must be told before confirming, and the `roles` grid column does not
// count (it is dropped in card/mobile view).
// ─────────────────────────────────────────────────────────────────────────────
describe('WP-832 review fix: the picker discloses the role replacement', () => {
  it('states the replacement in copy, not just via the roles column', () => {
    expect(picker).toContain('REPLACEMENT_NOTICE');
    expect(picker).toMatch(/REPLACES the role they hold today/);
    expect(picker).toMatch(/current role is revoked/);
  });

  it('shows the notice on the picker itself, before any selection', () => {
    expect(picker).toContain('user-role-rcrd-assign-user-warning');
  });

  it('requires a confirmation step — Save no longer writes directly', () => {
    expect(picker).toMatch(/onClick=\{requestConfirm\}/);
    expect(
      picker,
      'the select-users footer button must not call the mutation directly',
    ).not.toMatch(/data-test-id="user-role-rcrd-assign-user-save-btn"[\s\S]{0,200}onClick=\{handleSave\}/);
    expect(picker).toContain('user-role-rcrd-assign-user-confirm-btn');
  });

  it('names the roles being revoked, per user, on the confirmation step', () => {
    expect(picker).toContain('user-role-rcrd-assign-user-confirm-row');
    expect(picker).toMatch(/loses/);
    expect(picker).toContain('rolesOf(row)');
  });

  it('falls back to explicit copy when a user has no listed role', () => {
    expect(picker).toMatch(/current role will be replaced/);
  });

  it('lets the operator back out of the confirmation without writing', () => {
    expect(picker).toMatch(/setIsConfirming\(false\)/);
  });

  it('still adds no remove/unassign action (out of scope, Jira 14340)', () => {
    expect(picker).not.toMatch(/unassign|removeUsers|revokeRole/i);
  });
});
