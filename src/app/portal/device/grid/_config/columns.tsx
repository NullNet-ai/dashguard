"use client";

import { type ColumnDef } from "@tanstack/react-table";
import StatusCell from "~/components/ui/status-cell";
import GridDeviceLastHeartbeat from '../GridDeviceLastHeartbeat';
import GridDeviceStatus from '../GridDeviceStatus';
import Connectivity from '../GridDeviceConnectivity';
import { Badge } from '~/components/ui/badge';

const gridColumns = [
  {
    header: "ID",
    accessorKey: "code",
  },
  {
    header: "Status",
    accessorKey: "status",
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.status;
      return <StatusCell value={value} />;
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
    // !! TO BE UNCOMMENT IF advance filter for this is working
    search_config: {
      // operator: 'like',
      // entity: 'device_interface_addresses',
      // field: 'address',
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
    header: "Updated Date",
    accessorKey: "updated_date_time",
    data_type: "datetime",
    sortKey: ["updated_date", "updated_time"],
    search_config: {
      field: "updated_date_time",
      operator: 'like',
      custom_filter_field: 'updated_date',
    }
  },
  {
    header: 'Updated By',
    accessorKey: 'updated_by',
    data_type: 'string',
    sortKey: 'updated_by.full_name',
    search_config: {
      entity: 'updated_by',
      field: 'full_name',
      operator: 'like',
    },
  },
  {
    header: 'Created Date',
    accessorKey: 'created_date_time',
    data_type: 'datetime',
    sortKey: ['created_date', 'created_time'],
    search_config: {
      field: 'created_date_time',
      operator: 'like',
      custom_filter_field: 'created_date',
    },
  },
  {
    header: 'Created By',
    accessorKey: 'created_by',
    data_type: 'string',
    sortKey: 'created_by.full_name',
    search_config: {
      entity: 'created_by',
      field: 'full_name',
      operator: 'like',
    },
  },
] as ColumnDef<any>[];

export default gridColumns;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
