import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import contactGridColumns from '../../../src/app/portal/contact/grid/_config/columns';

const ROOT = join(__dirname, '../../..');
const COLS =
  'src/app/portal/(settings)/user_role/_components/forms/user-details/_config/columns.tsx';

// Ticket: "Columns: match the Users menu grid (the existing contact grid's
// columns). Copy them, do not hand-pick."
// The Users menu grid is src/app/portal/contact/grid — proven at runtime by the
// rendered header test-ids on /portal/contact/grid, which are exactly the
// accessorKeys of contact/grid/_config/columns.tsx.
describe('WP-832: User tab grid columns match the Users menu grid', () => {
  let src = '';
  try {
    src = readFileSync(join(ROOT, COLS), 'utf8');
  } catch {
    src = '';
  }

  it('the User tab has its own columns config file', () => {
    expect(src, `${COLS} must exist`).not.toBe('');
  });

  it('declares every accessorKey the contact grid declares', () => {
    const expected = contactGridColumns
      .map((c: any) => c.accessorKey)
      .filter(Boolean) as string[];

    // Sanity: the reference list is non-empty, so this cannot pass vacuously.
    expect(expected.length).toBeGreaterThan(10);

    for (const key of expected) {
      expect(src, `missing column accessorKey '${key}'`).toContain(`'${key}'`);
    }
  });

  it('includes the key contact columns explicitly', () => {
    for (const key of [
      'status',
      'code',
      'categories',
      'roles',
      'device_group_names',
      'first_name',
      'last_name',
      'middle_name',
      'formatted_raw_phone_number',
      'email',
      'organization',
      'updated_date_time',
      'updated_by',
      'created_date_time',
      'created_by',
    ]) {
      expect(src, `missing '${key}'`).toContain(key);
    }
  });
});
