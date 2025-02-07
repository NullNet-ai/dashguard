'use client'

import { type ColumnDef } from '@tanstack/react-table'
import React from 'react'

import StatusCell from '~/components/ui/status-cell'

const gridColumns = [
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
    header: 'Name',
    accessorKey: 'name',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Type',
    accessorKey: 'type',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Values',
    accessorKey: 'value',
    search_config: {
      operator: 'like',
    },
    cell: ({ row }) => {
      const value = row?.original?.value
      return (
        <span>
          {value?.split(' ').join(', ')}
        </span>
      )
    },
  },
  {
    header: 'Description',
    accessorKey: 'description',
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
        <div className='flex items-center gap-x-2'>
          <div>{date}</div>
          <div>{time}</div>
        </div>
      )
    },
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
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
  {
    header: 'Created By',
    accessorKey: 'created_by',
    sortKey: 'created_by.first_name',
    search_config: {
      entity: 'created_by',
      field: 'first_name',
      operator: 'like',
    },
  },
] as ColumnDef<any>[]

export default gridColumns

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = []
