'use client'

import { type ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/ui/badge'
import StatusCell from '~/components/ui/status-cell'

import Connectivity from '../GridDeviceConnectivity'
import GridDeviceLastHeartbeat from '../GridDeviceLastHeartbeat'
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
    search_config: {
      operator: 'like',
    },

  },
  {
    header: 'Instance Name',
    accessorKey: 'instance_name',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Type',
    accessorKey: 'model',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Hierarchy',
    accessorKey: 'hierarchy',
    sortKey: 'device_group_settings.name',
    search_config: {
      operator: 'like',
      entity: 'device_group_settings',
      field: 'name',
    },
  },
  {
    header: 'WAN Address',
    accessorKey: 'ip_address',
    sortKey: 'device_interface_addresses.address',
    search_config: {
      operator: 'like',
      entity: 'device_interface_addresses',
      field: 'address',
      parse_as: 'text',
    },
    cell: ({ row }) => {
      const wan_addresses = row?.original?.wan_addresses
      return (
        <div className = 'flex flex-wrap gap-2'>

          {wan_addresses?.map((address: string, idx: string) => {
            return (
              <Badge key = { idx } variant = 'primary'>
                {address}
              </Badge>
            )
          }) }
        </div>
      )
    },
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
    accessorKey: 'device_status',
    search_config: {
      operator: 'like',
      entity: 'devices',
      field: 'device_status',
    },
  },
  {
    header: 'UUID',
    accessorKey: 'system_id',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Version',
    accessorKey: 'device_version',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Last Heartbeat',
    accessorKey: 'last_heartbeat',
    cell: ({ row }) => {
      const device_id = row?.original?.id

      return <GridDeviceLastHeartbeat device_id={device_id} />
    },
    search_config: {
      operator: 'like',
      entity: 'devices',
      field: 'last_heartbeat',
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
