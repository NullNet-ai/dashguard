import { ColumnDef } from '@tanstack/react-table';

// Columns for the member (assigned) devices grid — fields come from
// deviceGroup.members, which flattens the joined device onto the junction row.
export const gridColumns = [
  {
    header: 'Device Name',
    accessorKey: 'device_name',
    sortKey: 'devices.device_name',
  },
  {
    header: 'Device Code',
    accessorKey: 'device_code',
    sortKey: 'devices.code',
  },
  {
    header: 'Status',
    accessorKey: 'device_status',
    sortKey: 'devices.status',
  },
] as unknown as ColumnDef<any>[];

export const TO_HIDE_COLUMNS_WHEN_MOBILE: string[] = [
  'device_code',
  'device_status',
];

export const defaultSorting = [
  { id: 'device_name', desc: false, sort_key: 'devices.device_name' },
];

// Columns for the assign drawer — deviceGroup.assignableDevices returns raw devices.
export const pickerColumns = [
  {
    header: 'Device Name',
    accessorKey: 'device_name',
  },
  {
    header: 'Device Code',
    accessorKey: 'code',
  },
] as unknown as ColumnDef<any>[];

export const pickerSorting = [
  { id: 'device_name', desc: false, sort_key: 'device_name' },
];
