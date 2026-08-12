'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { GridSessionStatusBadge } from '~/app/portal/device/grid/GridDeviceOnlineBadge'

const formatTimeWithoutSeconds = (value: unknown) => {
  if (typeof value !== 'string') return value
  const match = value.match(/^(\d{2}:\d{2})(?::\d{2})?$/)
  if (!match) return value
  return match[1]
}

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
    header: 'Type',
    accessorKey: 'tunnel_type',
    sortKey: 'device_tunnels.tunnel_type',
    search_config: {
      operator: 'like',
      entity: 'device_tunnels',
      field: 'tunnel_type',
    },
    cell: ({ row }) => {
      const tunnel_type = row?.original?.tunnel_type ?? '';
      return <div>{`${tunnel_type.toUpperCase()}`}</div>;
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
    accessorKey: 'tunnel_status',
    sortKey: 'device_tunnels.tunnel_status',
    cell: ({ row }) => {
      const value = row?.original?.tunnel_status
      return <GridSessionStatusBadge status={value} />
    },
    search_config: {
      entity: 'device_tunnels',
      operator: 'like',
      field: 'tunnel_status',
    },
  },
  {
    header: "Last Accessed Date",
    accessorKey: "last_access_date_time",
    data_type: "datetime",
    sortKey: "last_access_date_time",
    search_config: {
      field: "last_access_date_time",
      operator: 'like',
      custom_filter_field: 'last_access_date',
    }
  },
  {
    header: "Updated Date",
    accessorKey: "updated_date_time",
    data_type: "datetime",
    sortKey: "updated_date_time",
    search_config: {
      field: "updated_date_time",
      operator: 'like',
      custom_filter_field: 'updated_date',
    }
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    // @ts-expect-error - No type yet
    sortKey: 'contacts.contact_updated_by',
    // search_config: {
    //   entity: 'contacts',
    //   field: 'contact_updated_by',
    //   operator: 'like',
    // },
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date_time',
    data_type: 'datetime',
    sortKey: "created_date_time",
    search_config: {
      field: 'created_date_time',
      operator: 'like',
      custom_filter_field: 'created_date',
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
    header: "Updated Date",
    accessorKey: "updated_date_time",
    data_type: "datetime",
    sortKey: "updated_date_time",
    search_config: {
      field: "updated_date_time",
      operator: 'like',
      custom_filter_field: 'updated_date',
    }
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    // @ts-expect-error - No type yet
    sortKey: 'contacts.contact_updated_by',
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date_time',
    data_type: 'datetime',
    sortKey: "created_date_time",
    search_config: {
      field: 'created_date_time',
      operator: 'like',
      custom_filter_field: 'created_date',
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
    header: "Updated Date",
    accessorKey: "updated_date_time",
    data_type: "datetime",
    sortKey: "updated_date_time",
    search_config: {
      field: "updated_date_time",
      operator: 'like',
      custom_filter_field: 'updated_date',
    }
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    // @ts-expect-error - No type yet
    sortKey: 'contacts.contact_updated_by',
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date_time',
    data_type: 'datetime',
    sortKey: "created_date_time",
    search_config: {
      field: 'created_date_time',
      operator: 'like',
      custom_filter_field: 'created_date',
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
