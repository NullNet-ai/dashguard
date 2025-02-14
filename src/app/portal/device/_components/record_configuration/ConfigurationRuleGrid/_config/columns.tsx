'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { mapRuleEndpointAddress } from '~/app/portal/device/utils/mapRuleEndpointAddress'

import { Badge } from '~/components/ui/badge'
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
    header: 'Status',
    accessorKey: 'device_rule_status',
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.device_rule_status
      return <Badge variant={value == 'Applied' ? 'success' : 'warning'}>{value}</Badge>
    },
  },
  {
    header: 'Mode',
    accessorKey: 'disabled',
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.disabled
      if (![true, false]?.includes(value)) return null
      return <Badge variant={value ? 'destructive' : 'success'}>{value ? 'Disabled' : 'Enabled'}</Badge>
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
    header: 'Action',
    accessorKey: 'policy',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Protocol',
    accessorKey: 'protocol',
    search_config: {
      operator: 'like',
    },
    cell: ({row}) => row.original?.protocol?.toUpperCase() ?? "*"
  },
  {
    header: 'Source',
    accessorKey: 'source_addr',
    search_config: {
      operator: 'like',
    },
    cell: ({row}) => {
      const source_type = row.original?.source_type ?? "address";
      const source_addr = row.original?.source_addr ?? "*";
      return <>{mapRuleEndpointAddress(source_addr, source_type)}</>
    }
  },
  {
    header: 'Src Port',
    accessorKey: 'source_port',
    search_config: {
      operator: 'like',
    },
  },

  {
    header: 'Destination',
    accessorKey: 'destination_addr',
    search_config: {
      operator: 'like',
    },
    cell: ({row}) => {
      const destination_type = row.original?.destination_type ?? "address";
      const destination_addr = row.original?.destination_addr ?? "*";
      return <>{mapRuleEndpointAddress(destination_addr, destination_type)}</>
    }
  },
  {
    header: 'Dest Port',
    accessorKey: 'destination_port',
    search_config: {
      operator: 'like',
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
