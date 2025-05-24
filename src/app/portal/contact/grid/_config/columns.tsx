'use client';

import { type ColumnDef } from '@tanstack/react-table';
import StatusCell from '~/components/ui/status-cell';

// ? This is initial grid columns for the <entity> module
// ? You can add or remove columns as per your requirement
const gridColumns = [
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
    header: 'ID',
    accessorKey: 'code',
    data_type: 'string',
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
    sort_config: {
      is_case_sensitive_sorting: true
    },
  },
  {
    header: 'First Name',
    accessorKey: 'first_name',
  },
  {
    header: 'Last Name',
    accessorKey: 'last_name',
  },
  {
    header: 'Middle Name',
    accessorKey: 'middle_name',
    data_type: 'string',
  },
  {
    header: 'Primary Phone Number',
    accessorKey: 'formatted_raw_phone_number',
    sortKey: 'contact_phone_number.raw_phone_number',
    search_config: {
      field: 'raw_phone_number',
      entity: 'contact_phone_numbers',
    },
  },
  {
    header: 'Primary Email',
    accessorKey: 'email',
    sortKey: 'contact_email.email',
    search_config: {
      entity: 'contact_emails',
    },
  },
  {
    header: 'Department',
    accessorKey: 'organization',
    isSearchable: false,
    cell: ({ row }) => {
      const departments = row?.original?.organization || [];
      if (!Array.isArray(departments)) return;
      return departments?.map((organization: string, index: number) => {
        return <StatusCell key={index} value={organization} />;
      });
    },
    search_config: {
      entity: 'organization',
      field: 'name',
      operator: 'like',
    },
  },
  {
    header: "Updated Date",
    accessorKey: "updated_date_time",
    data_type: "datetime",
    sortKey: ["updated_date", "updated_time"],
    // isSearchable: false,
    search_config: {
      field: "updated_date_time",
      operator: 'like'
    }
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    data_type: 'string',
    sortKey: 'updated_by.full_name',
    // isSearchable: false,
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
    // isSearchable: false,
    search_config: {
      field: 'created_date_time',
      operator: 'like',
    },
  },
  {
    header: 'Created By',
    accessorKey: 'created_by',
    data_type: 'string',
    sortKey: 'created_by.full_name',
    // isSearchable: false,
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
