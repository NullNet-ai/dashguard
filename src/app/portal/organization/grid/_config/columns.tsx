'use client';

import { type ColumnDef } from '@tanstack/react-table';
import StatusCell from '~/components/ui/status-cell';

const gridColumns = [
  {
    header: 'State',
    accessorKey: 'status',
    cell: ({ row }) => {
      const value = row?.original?.status;
      return <StatusCell value={value} />;
    },
  },
  {
    header: 'ID',
    accessorKey: 'code',
  },
  {
    header: 'Category',
    accessorKey: 'categories',
    data_type: 'array',
    cell: ({ row }) => {
      const categories = row?.original?.categories || [];
      return categories?.map((category: string, index: number) => {
        return <StatusCell key={index} value={category} />;
      });
    },
    search_config: {
      operator: 'like',
      parse_as: 'text'
    },
    sort_config: {
      is_case_sensitive_sorting: true
    },
  },
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: "Updated Date",
    accessorKey: "updated_date_time",
    data_type: "datetime",
    sortKey: ["updated_date", "updated_time"],
    search_config: {
      field: "updated_date_time",
      operator: 'like',
      custom_filter_field: 'updated_date',
    }
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
    accessorKey: 'created_date_time',
    data_type: 'datetime',
    sortKey: ['created_date', 'created_time'],
    search_config: {
      field: 'created_date_time',
      operator: 'like',
      custom_filter_field: 'created_date',
    },
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
