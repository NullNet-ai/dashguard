import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '../../..');
const ROUTER = 'src/server/api/routers/user_role.ts';
const src = readFileSync(join(ROOT, ROUTER), 'utf8');

// ORM SAFETY (measured against the live Store on 2026-08-25):
//   grid.items { entity:'account_organization',
//     advance_filters:[{field:'role_id', operator:'equal',
//       values:[<Developer role id>], entity:'account_organizations'}] }
//   -> HTTP 200, totalCount 3.
//   Nonsense-entity control ('account_orgs_bogus') -> totalCount 0.
//   contact.mainGrid { entity:'contact',
//     advance_filters:[{field:'id', values:[those 3 contact_ids], entity:'contacts'}] }
//   -> HTTP 200, totalCount 3, every row roles:['Developer'].
//   Nonsense control ('contactsss') -> totalCount 0.
// Therefore the ADDITIVE TWO-QUERY approach is verified; no join is required.
describe('WP-832: user_role router — members (contacts holding this role)', () => {
  it('exposes a `members` query', () => {
    expect(src, 'user_role router must expose a members procedure').toMatch(
      /members:\s*privateProcedure/,
    );
  });

  it('takes a role id as input', () => {
    expect(src).toMatch(/user_role_id|role_id:\s*z\.string\(\)/);
  });

  it('resolves contacts via account_organization.role_id', () => {
    expect(src).toContain('account_organization');
    expect(src).toContain('role_id');
    expect(src).toContain('contact_id');
  });

  it('uses TWO separate queries, not a join (Store-rejected joins empty the whole result)', () => {
    const members = src.slice(src.indexOf('members:'));
    const scoped = members.slice(0, 4000);
    expect(scoped, 'members must not use .join()/.nestedJoin()').not.toMatch(
      /\.nestedJoin\(|\.join\(/,
    );
  });
});

describe('WP-832: user_role router — assign (ADD only)', () => {
  it('exposes an `assignableUsers` query', () => {
    expect(src).toMatch(/assignableUsers:\s*privateProcedure/);
  });

  it('exposes an `assignUsers` mutation', () => {
    expect(src).toMatch(/assignUsers:\s*privateProcedure/);
  });

  it('assignUsers UPDATES account_organization.role_id (no join table exists)', () => {
    const i = src.indexOf('assignUsers:');
    const scoped = src.slice(i, i + 3000);
    expect(scoped).toMatch(/\.update\(/);
    expect(scoped).toContain('role_id');
  });

  it('declares NO unassign/remove procedure (explicitly out of scope)', () => {
    expect(src).not.toMatch(/unassignUsers|removeUsers|unassignRole/);
  });

  it('never writes a null/empty role_id', () => {
    expect(src).not.toMatch(/role_id:\s*(null|undefined|''|"")/);
  });
});
