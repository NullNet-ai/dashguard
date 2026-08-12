'use client';

import { type ColumnDef } from '@tanstack/react-table';


// ? This is initial grid columns for the <entity> module
// ? You can add or remove columns as per your requirement
export const gridColumns = [
  {
    header: 'State',
    accessorKey: 'status',
  },
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Responsible Account ID',
    accessorKey: 'responsible_account_id',
    data_type: 'string',
  },
   {
    header: 'Event ID',
    accessorKey: 'event_id',
    data_type: 'string',
  },
   {
    header: 'Record ID',
    accessorKey: 'record_id',
    data_type: 'string',
  },
  {
    header: 'Event Name',
    accessorKey: 'event_name',
    data_type: 'string',
    isSearchable: false,
  },
  {
    header: 'Created Date',
    accessorKey: 'record_created_date',
    data_type: 'datetime',
  },
  {
    header: 'Created Time',
    accessorKey: 'record_created_time',
    data_type: 'string',
  },
   {
    header: 'Updated Date',
    accessorKey: 'record_updated_date',
    data_type: 'datetime',
  },
   {
    header: 'Updated Time',
    accessorKey: 'record_updated_time',
    data_type: 'string',
  },
  {
    header: 'New Value',
    accessorKey: 'new_value',
    data_type: 'object',
    search_config: {
      operator: 'like',
      parse_as: 'text'
    },
  },
  {
    header: 'Responsible Account Full Name',
    accessorKey: 'responsible_account_full_name',
    data_type: 'string',
  },
  {
    header: 'Responsible Role Name',
    accessorKey: 'responsible_role_name',
    data_type: 'string',
  },
  {
    header: 'Record Code',
    accessorKey: 'record_code',
    data_type: 'string',
  },
  {
    header: 'Table',
    accessorKey: 'table',
    data_type: 'string',
    isSearchable: false,
  },
  {
    header: 'Action',
    accessorKey: 'action',
    search_config: {
      operator: 'like',
      parse_as: 'text'
    },
    // isSearchable: false,
    sort_config: {
      is_case_sensitive_sorting: true
    },
    value_alias: {
        INSERT: 'CREATED',
        UPDATE: 'UPDATED',
        'SOFT DELETE': 'ARCHIVED',
    }
  },

] as ColumnDef<any>[];

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
