'use client';

import { type ColumnDef } from '@tanstack/react-table';
import StatusCell from '~/components/ui/status-cell';

// ? This is initial grid columns for the <entity> module
// ? You can add or remove columns as per your requirement
const gridColumns = [
  {
    header: 'ID',
    accessorKey: 'code',
    // dataType: 'string',
  },
  {
    header: 'State',
    accessorKey: 'status',
    data_type: 'string',
    cell: ({ row }) => {
      const value = row?.original?.status;
      return <StatusCell value={value} renderType="value" />;
    },
  },
  {
    header: 'Category',
    accessorKey: 'categories',
    data_type: 'array',
    cell: ({ row }) => {
      const categories = row?.original?.categories || [];
      return categories?.map((category: string, index: number) => {
        return <StatusCell key={index} value={category} renderType="value" />;
      });
    },
    search_config: {
      operator: 'like',
      parse_as: 'text'
    },
  },
  {
    header: 'Location Name',
    accessorKey: 'location_name',
    dataType: 'string',
  },
  {
    header: 'Updated Date',
    accessorKey: 'updated_date',
    // dataType: 'string',
    cell: ({ row }) => {
      const date = row?.original?.updated_date;
      const time = row?.original?.updated_time;
      return (
        <div className="flex items-center gap-x-2">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      );
    },
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    // dataType: 'string',
    sortKey: 'updated_by.first_name',
    search_config: {
      entity: 'updated_by',
      field: 'first_name',
      operator: 'like',
    },
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date',
    // dataType: 'string',
    cell: ({ row }) => {
      const date = row?.original?.created_date;
      const time = row?.original?.created_time;
      return (
        <div className="flex items-center gap-x-2">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      );
    },
  },
  {
    header: 'Created By',
    accessorKey: 'created_by',
    // dataType: 'string',
    sortKey: 'created_by.first_name',
    search_config: {
      entity: 'created_by',
      field: 'first_name',
      operator: 'like',
    },
  },
] as ColumnDef<any>[];

export default gridColumns;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
