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

  // Review fix: this used to derive `expected` from contactGridColumns while the
  // config under test simply RE-EXPORTS contactGridColumns — i.e. it compared the
  // contact grid to itself and could never fail. The expectation is now an
  // explicit literal list, and a separate assertion pins the contact grid to that
  // same list, so drift on EITHER side fails.
  const EXPECTED_COLUMNS = [
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
  ];

  it('declares every expected accessorKey explicitly', () => {
    for (const key of EXPECTED_COLUMNS) {
      expect(src, `missing column accessorKey '${key}'`).toContain(`'${key}'`);
    }
  });

  it('the contact grid still declares exactly that column set (drift guard)', () => {
    const actual = contactGridColumns
      .map((c: any) => c.accessorKey)
      .filter(Boolean) as string[];

    expect([...actual].sort()).toEqual([...EXPECTED_COLUMNS].sort());
  });

  it('strips the accessorKey-less drag handle from BOTH grids', () => {
    // The contact grid ships a drag-handle column with no accessorKey; neither
    // grid on this tab reorders rows, so neither may render it.
    expect(
      contactGridColumns.some((c: any) => !c.accessorKey),
      'contact grid should still have an accessorKey-less column, else this guard is vacuous',
    ).toBe(true);
    expect(src).not.toMatch(/export const gridColumns = contactGridColumns/);
    expect(src).toMatch(/export const gridColumns = PARITY_COLUMNS/);
    expect(src).toMatch(/export const pickerColumns = PARITY_COLUMNS/);
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
