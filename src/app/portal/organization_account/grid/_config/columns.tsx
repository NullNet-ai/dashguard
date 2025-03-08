'use client'

import { type ColumnDef } from '@tanstack/react-table'

import StatusCell from '~/components/ui/status-cell'

const statuses = {
  'active': 'text-green-600 bg-green-400/10',
  'invited': 'text-yellow-600 bg-yellow-400/10',
  'pending setup': 'text-yellow-500 bg-yellow-400/10',
  'invitation canceled': 'text-red-600 bg-red-400/10',
  'invitation expired': 'text-orange-600 bg-orange-400/10',
  'access disabled': 'text-red-600 bg-red-400/10',
  'deactivated': 'text-gray-600 bg-gray-400/10',
  'internal user': 'text-blue-600 bg-blue-400/10',
  'external user': 'text-blue-600 bg-blue-400/10',
}

const gridColumns = [
  {
    header: 'State',
    accessorKey: 'status',
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.status
      return <StatusCell additionalStatuses={statuses} value={value} />
    },
  },
  {
    header: 'ID',
    accessorKey: 'code',
  },
  {
    header: 'Category',
    accessorKey: 'categories',
    cell: ({ row }) => {
      const categories = row?.original?.categories || []
      return categories?.map((category: string, index: number) => {
        return (
          <StatusCell
            additionalStatuses={statuses}
            key={index}
            value={category}
          />
        )
      })
    },
    search_config: {
      operator: 'contains',
    },
  },
  {
    header: 'First Name',
    accessorKey: 'first_name',
    sortKey: 'contact.first_name',
    search_config: {
      entity: 'contact',
    },
  },
  {
    header: 'Last Name',
    accessorKey: 'last_name',
    sortKey: 'contact.last_name',
    search_config: {
      entity: 'contact',
    },
  },
  {
    header: 'Username',
    accessorKey: 'account_id',
  },
  {
    header: 'Status',
    accessorKey: 'account_status',
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.account_status
      if (!value) return null
      return <StatusCell additionalStatuses={ statuses } value={ value } />
    },
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    sortKey: 'updated_by.full_name',
    search_config: {
      entity: 'updated_by',
      field: 'full_name',
      operator: 'like',
    },
  },
  {
    header: 'Updated At',
    accessorKey: 'updated_date',
    cell: ({ row }) => {
      const date = row?.original?.updated_date
      const time = row?.original?.updated_time
      return (
        <div className='flex items-center gap-x-2'>
          <div>{date}</div>
          <div>{time}</div>
        </div>
      )
    },
  },
  {
    header: 'Created By',
    accessorKey: 'created_by',
    sortKey: 'created_by.full_name',
    search_config: {
      entity: 'created_by',
      field: 'full_name',
      operator: 'like',
    },
  },
  {
    header: 'Created At',
    accessorKey: 'created_date',
    sortKey: ['created_date', 'created_time'],
    cell: ({ row }) => {
      const date = row?.original?.created_date
      const time = row?.original?.created_time
      return (
        <div className='flex items-center gap-x-2'>
          <div>{date}</div>
          <div>{time}</div>
        </div>
      )
    },
  },
] as ColumnDef<any>[]

export default gridColumns

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = []
