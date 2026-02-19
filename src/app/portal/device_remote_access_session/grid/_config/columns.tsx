'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { GridSessionStatusBadge } from '~/app/portal/device/grid/GridDeviceOnlineBadge'

const uiGridColumns = [
  {
    header: 'ID',
    accessorKey: 'code',
    search_config: {
      entity: 'device_tunnels',
      operator: 'like',
    },
  },
  {
    header: 'Address',
    accessorKey: 'address',
    sortKey: 'device_services.address',
    search_config: {
      entity: 'device_services',
      operator: 'like',
      field: 'address',
      parse_as: "text",
    },
  },
  {
    header: 'Port',
    accessorKey: 'port',
    sortKey: 'device_services.port',
    search_config: {
      entity: 'device_services',
      operator: 'like',
      field: 'port',
      parse_as: "text",
    },
  },
  {
    header: 'Device',
    accessorKey: 'device_name',
    sortKey: 'devices.device_name',
    search_config: {
      operator: 'like',
      entity: 'devices',
      field: 'device_name',
    },
  },

  {
    header: 'Status',
    accessorKey: 'session_status',
    sortKey: 'device_ssh_sessions.session_status',
    cell: ({ row }) => {
      const value = row?.original?.session_status
      return <GridSessionStatusBadge status={value} />
    },
    search_config: {
      entity: 'device_ssh_sessions',
      operator: 'like',
      field: 'session_status',
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
    // search_config: {
    //   entity: 'contacts',
    //   field: 'contact_updated_by',
    //   operator: 'like',
    // },
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
    // search_config: {
    //   entity: 'contacts',
    //   field: 'contact_created_by',
    //   operator: 'like',
    // },
  },
] as ColumnDef<any>[]

export const sshGridColumns = [
  {
    header: 'ID',
    accessorKey: 'code',
    search_config: {
      entity: 'device_ssh_sessions',
      operator: 'like',
    },
  },
  {
    header: 'Address',
    accessorKey: 'address',
    sortKey: 'device_services.address',
    search_config: {
      entity: 'device_services',
      operator: 'like',
      field: 'address',
      parse_as: "text",
    },
  },
  {
    header: 'Port',
    accessorKey: 'port',
    sortKey: 'device_services.port',
    search_config: {
      entity: 'device_services',
      operator: 'like',
      field: 'port',
      parse_as: "text",
    },
  },
  {
    header: 'Device',
    accessorKey: 'device_name',
    sortKey: 'devices.device_name',
    search_config: {
      operator: 'like',
      entity: 'devices',
      field: 'device_name',
    },
  },
  {
    header: 'Status',
    accessorKey: 'session_status',
    sortKey: 'device_ssh_sessions.session_status',
    cell: ({ row }) => {
      const value = row?.original?.session_status
      return <GridSessionStatusBadge status={value} />
    },
    search_config: {
      entity: 'device_ssh_sessions',
      operator: 'like',
      field: 'session_status',
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
  },
] as ColumnDef<any>[]

export const ttyGridColumns = [
  {
    header: 'ID',
    accessorKey: 'code',
    search_config: {
      entity: 'device_tty_sessions',
      operator: 'like',
    },
  },
  {
    header: 'Address',
    accessorKey: 'address',
    sortKey: 'device_services.address',
    search_config: {
      entity: 'device_services',
      operator: 'like',
      field: 'address',
      parse_as: "text",
    },
  },
  {
    header: 'Port',
    accessorKey: 'port',
    sortKey: 'device_services.port',
    search_config: {
      entity: 'device_services',
      operator: 'like',
      field: 'port',
      parse_as: "text",
    },
  },
  {
    header: 'Device',
    accessorKey: 'device_name',
    sortKey: 'devices.device_name',
    search_config: {
      operator: 'like',
      entity: 'devices',
      field: 'device_name',
    },
  },
  {
    header: 'Status',
    accessorKey: 'session_status',
    sortKey: 'device_tty_sessions.session_status',
    cell: ({ row }) => {
      const value = row?.original?.session_status
      return <GridSessionStatusBadge status={value} />
    },
    search_config: {
      entity: 'device_tty_sessions',
      operator: 'like',
      field: 'session_status',
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
  },
] as ColumnDef<any>[]

export default uiGridColumns

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = []
