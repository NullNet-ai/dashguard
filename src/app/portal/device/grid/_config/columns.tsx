'use client'

import { type ColumnDef } from '@tanstack/react-table'

import StatusCell from '~/components/ui/status-cell'

import GridDeviceLastHeartbeat from '../GridDeviceLastHeartbeat'
import GridDeviceStatus from '../GridDeviceStatus'
import Connectivity from '../GridDeviceConnectivity';

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
    search_config: {
      operator: 'like',
    }
  },
  {
    header: 'Type',
    accessorKey: 'model',
    search_config: {
      operator: 'like',
    }
  },
  {
    header: 'Hierarchy',
    accessorKey: 'hierarchy',
    search_config: {
      operator: 'like',
      // entity: 'device_group_settings',
      // field: 'name',
      // operator: 'like',
    }
  },
  {
    header: 'WAN Address',
    accessorKey: 'ip_address',
    search_config: {
      entity: 'device_configurations.device_interfaces',
      field: 'address',
      operator: 'like',
    }
  },
  {
    header: 'Connectivity',
    cell: ({ row }) => {
      return (
        <Connectivity device_id={row?.original?.id as string} />
      )
    },
  },
  {
    header: 'Status',
    enableResizing: false,
    cell: ({ row }) => {
      return <GridDeviceStatus device_id={ row?.original?.id } />
    },
  },
  {
    header: 'UUID',
    accessorKey: 'system_id',
    search_config: {
      operator: 'like',
    }
  },
  {
    header: 'Version',
    accessorKey: 'device_version',
    search_config: {
      operator: 'like',
    }
  },
  {
    header: 'Last Heartbeat',
    accessorKey: 'last_heartbeat',
    cell: ({ row }) => {
      const device_id = row?.original?.id

      return <GridDeviceLastHeartbeat device_id={device_id} />
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
