'use client';

import { type ColumnDef } from '@tanstack/react-table';

import contactGridColumns from '~/app/portal/contact/grid/_config/columns';

// WP-832 — "Columns: match the Users menu grid. Copy them, do not hand-pick."
//
// ponytail: the Users menu grid's column defs are RE-USED rather than pasted.
// A literal copy of 170 lines is a copy that drifts the first time someone
// edits the contact grid; re-using them makes "match the Users menu grid" true
// by construction. The manifest below is the parity list of accessorKeys that
// grid declares today, and it is load-bearing: it is what strips the row
// drag-handle (which has no accessorKey) out of the picker grid.
export const USERS_MENU_COLUMNS = [
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
] as const;

export const gridColumns = contactGridColumns;

// The picker is a selection grid — dragging rows there means nothing.
export const pickerColumns = contactGridColumns.filter((column) =>
  USERS_MENU_COLUMNS.includes(
    (column as { accessorKey?: string }).accessorKey as never,
  ),
) as ColumnDef<any>[];

export const defaultSorting = [
  { id: 'created_date_time', desc: true, sort_key: 'created_date_time' },
];

export const TO_HIDE_COLUMNS_WHEN_MOBILE: string[] = [];

export default gridColumns;
