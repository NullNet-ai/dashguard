import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '../../..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const exists = (p: string) => {
  try { read(p); return true; } catch { return false; }
};

// The LIVE tab list for the user_role record is the INLINE array in layout.tsx,
// which is passed to the PLATFORM RecordWrapper (~/components/platform/Record/RecordWrapper).
// `record/_config/tabs.ts` is dead code: its only importer is
// record/[code]/_components/RecordWrapper/index.tsx, which nothing imports.
// Proven at runtime: the rendered tab test-ids are `user_role-rcrdtab-dashboard`
// and `user_role-rcrdtab-role` — "Role" is the inline array's name; the dead
// config says "User Role" and would have produced `-rcrdtab-user-role`.
const LAYOUT =
  'src/app/portal/(settings)/user_role/record/[code]/layout.tsx';
const DEAD_CONFIG =
  'src/app/portal/(settings)/user_role/record/_config/tabs.ts';

describe('WP-832: live tab config', () => {
  it('layout.tsx is the live tab config (imports the platform RecordWrapper)', () => {
    const src = read(LAYOUT);
    expect(src).toContain("~/components/platform/Record/RecordWrapper");
    expect(src).toContain('tabs={tabs}');
  });

  it('the dead _config/tabs.ts is not imported by the live layout', () => {
    expect(read(LAYOUT)).not.toContain('_config/tabs');
  });

  it('declares a "User" tab in the LIVE inline tabs array', () => {
    const src = read(LAYOUT);
    expect(src, 'layout.tsx inline tabs array must declare tabName: \'user\'')
      .toMatch(/tabName:\s*'user'/);
    expect(src, 'layout.tsx inline tabs array must declare name: \'User\'')
      .toMatch(/name:\s*'User'/);
  });

  it('keeps the existing Dashboard and Role tabs', () => {
    const src = read(LAYOUT);
    expect(src).toMatch(/tabName:\s*'dashboard'/);
    expect(src).toMatch(/tabName:\s*'user_role'/);
  });
});

describe('WP-832: parallel route slot for the User tab', () => {
  const TAB = 'src/app/portal/(settings)/user_role/record/[code]/(record)/user';

  it('has a tab layout at (record)/user/layout.tsx', () => {
    expect(exists(`${TAB}/layout.tsx`)).toBe(true);
  });

  it('has a @user_details slot page', () => {
    expect(exists(`${TAB}/@user_details/page.tsx`)).toBe(true);
  });

  it('the slot layout renders the user_details slot', () => {
    expect(read(`${TAB}/layout.tsx`)).toContain('user_details');
  });
});

describe('WP-832: scope guards (must stay green)', () => {
  it('does NOT modify the dead _config/tabs.ts into the live path', () => {
    // The dead config may stay in sync, but must never become the source of truth.
    expect(read(LAYOUT)).not.toContain("import tabs from");
  });

  it('builds no remove/unassign action (REMOVE is out of scope)', () => {
    const dir = 'src/app/portal/(settings)/user_role/_components/forms/user-details';
    for (const f of ['client.tsx', 'server.tsx', 'UserPicker.tsx']) {
      if (!exists(`${dir}/${f}`)) continue;
      const src = read(`${dir}/${f}`);
      expect(src, `${f} must not implement unassign/remove`).not.toMatch(/unassign|removeUser|customRowAction/i);
    }
  });

  it('never blanks a role_id anywhere in the new router code', () => {
    const p = 'src/server/api/routers/user_role.ts';
    const src = read(p);
    expect(src).not.toMatch(/role_id:\s*(null|''|"")/);
  });
});
