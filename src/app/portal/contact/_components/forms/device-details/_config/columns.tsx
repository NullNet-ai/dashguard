import { ColumnDef } from '@tanstack/react-table';

export const gridColumns = [
  {
    header: 'Device Name',
    accessorKey: 'device_name',
    sortKey: 'devices.device_name',
    search_config: {
      entity: 'device',
      field: 'device_name',
      operator: 'like',
    },
  },
] as unknown as ColumnDef<any>[];

export const TO_HIDE_COLUMNS_WHEN_MOBILE: string[] = [];
