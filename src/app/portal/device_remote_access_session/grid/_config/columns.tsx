'use client'

import { type ColumnDef } from '@tanstack/react-table'

import StatusCell from '~/components/ui/status-cell'

const gridColumns = [
  {
    header: 'ID',
    accessorKey: 'code',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'State',
    accessorKey: 'status',
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.status
      return <StatusCell value={value} />
    },
  },
  {
    header: 'Category',
    accessorKey: 'remote_access_category',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Type',
    accessorKey: 'remote_access_type',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Device',
    accessorKey: 'device_name',
    sortKey: 'devices.instance_name',
    search_config: {
      operator: 'like',
      entity: 'devices',
      field: 'instance_name',
    },
  },

  {
    header: 'Status',
    accessorKey: 'remote_access_status',
    cell: ({ row }) => {
      const value = row?.original?.remote_access_status
      return <StatusCell value={value} />
    },
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Updated Date',
    accessorKey: 'updated_date',
    cell: ({ row }) => {
      const date = row?.original?.updated_date
      const time = row?.original?.updated_time
      return (
        <div className="flex items-center gap-x-2">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      )
    },
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    sortKey: 'contacts.contact_updated_by',
    search_config: {
      entity: 'contacts',
      field: 'contact_updated_by',
      operator: 'like',
    },
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date',
    cell: ({ row }) => {
      const date = row?.original?.created_date
      const time = row?.original?.created_time
      return (
        <div className="flex items-center gap-x-2">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      )
    },
  },
  {
    header: 'Created By',
    accessorKey: 'created_by',
    sortKey: 'contacts.contact_created_by',
    search_config: {
      entity: 'contacts',
      field: 'contact_created_by',
      operator: 'like',
    },
  },
] as ColumnDef<any>[]

export default gridColumns

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = []
