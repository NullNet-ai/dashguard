'use client'

import { type ColumnDef } from '@tanstack/react-table'

import StatusCell from '~/components/ui/status-cell'

import Connectivity from '../../_components/charts/GridConnectivity/client'
import GridDeviceStatus from '../GridDeviceStatus'

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
    header: 'ID',
    accessorKey: 'code',
  },
  {
    header: 'Instance Name',
    accessorKey: 'instance_name',
  },
  {
    header: 'Type',
    accessorKey: 'model',
  },
  {
    header: 'Hierarchy',
    accessorKey: 'hierarchy',
  },
  {
    header: 'WAN Address',
    accessorKey: 'ip_address',
  },
  {
    header: 'Connectivity',
    accessorKey: 'connectivity',
    cell: ({ row }) => {
      // return <GridBarGraph />;
      return (
        <Connectivity device_id={row?.original?.id as string} />
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'device_status',
    enableResizing: false,
    cell: ({ row }) => {
      const device_id = row?.original?.id
      return <GridDeviceStatus device_id={device_id} />
    },
  },
  {
    header: 'UUID',
    accessorKey: 'uuid',
  },
  {
    header: 'Version',
    accessorKey: 'version',
  },
  {
    header: 'Last Heartbeat',
    accessorKey: 'last_heartbeat',
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
