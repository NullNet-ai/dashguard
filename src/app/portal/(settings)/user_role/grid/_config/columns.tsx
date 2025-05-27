'use client';
import { type ColumnDef } from '@tanstack/react-table';
import React from 'react';

import StatusCell from '~/components/ui/status-cell';

const gridColumns = [
  {
    header: 'State',
    accessorKey: 'status',
    enableResizing: false,
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
    header: 'Role',
    accessorKey: 'role',
  },
  {
    header: 'Entity',
    accessorKey: 'entity',
  },
  {
    header: 'Category',
    accessorKey: 'categories',
    enableResizing: false,
    cell: ({ row }) => {
      const categories = row?.original?.categories || [];
      return categories.map((category: string, index: number) => {
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
    header: 'Updated Date',
    accessorKey: 'updated_date',
    sortKey: ["updated_date", "updated_time"],
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
    sortKey: 'updated_by.full_name',
    isSearchable: false,
    search_config: {
      entity: 'updated_by',
      field: 'full_name',
      operator: 'like',
    },
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date',
    sortKey: ["created_date", "created_time"],
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
    sortKey: 'created_by.full_name',
    isSearchable: false,
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
