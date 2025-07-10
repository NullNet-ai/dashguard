'use client';

import { type ColumnDef } from '@tanstack/react-table';
import StatusCell from '~/components/ui/status-cell';
// import GridDeviceLastHeartbeat from '../GridDeviceLastHeartbeat';
import GridDeviceOnlineBadge from '../GridDeviceOnlineBadge';

const gridColumns = [
  {
    header: 'ID',
    accessorKey: 'code',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.status;
      return <StatusCell value={value} />;
    },
  },
  {
    header: 'Name',
    accessorKey: 'device_name',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Category',
    accessorKey: 'device_category',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Type',
    accessorKey: 'device_type',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Connection Status',
    cell: ({ row }) => (
      <GridDeviceOnlineBadge online={row.original.is_device_online} />
    ),
  },
  {
    header: 'UUID',
    accessorKey: 'device_uuid',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Updated Date',
    accessorKey: 'updated_date',
    data_type: 'datetime',
    sortKey: ['updated_date', 'updated_time'],
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    data_type: 'string',
    sortKey: 'updated_by.full_name',
    search_config: {
      entity: 'updated_by',
      field: 'full_name',
      operator: 'like',
    },
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date',
    data_type: 'datetime',
    sortKey: ['created_date', 'created_time'],
  },
  {
    header: 'Created By',
    accessorKey: 'created_by',
    data_type: 'string',
    sortKey: 'created_by.full_name',
    search_config: {
      entity: 'created_by',
      field: 'full_name',
      operator: 'like',
    },
  },
] as ColumnDef<any>[];

export default gridColumns;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
