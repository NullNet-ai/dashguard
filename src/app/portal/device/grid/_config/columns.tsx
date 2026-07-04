"use client";

import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import StatusCell from "~/components/ui/status-cell";
import AuthorizationCell from '../_components/AuthorizationCell';
import GridDeviceOnlineBadge from '../GridDeviceOnlineBadge';

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
  // {
  //   header: 'Authorized',
  //   accessorKey: 'is_device_authorized',
  //   enableColumnFilter: false,
  //   enableSorting: true,
  //   enableResizing: false,
  //   sort_config: {
  //     type: 'boolean',
  //   },
  //   cell: ({ row }) => {
  //     const authorized = row?.original?.is_device_authorized ?? false;
  //     return <AuthorizationCell authorized={authorized} />;
  //   },
  // },
  {
    header: 'Name',
    accessorKey: 'device_name',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Category',
    accessorKey: 'device_category',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Type',
    accessorKey: 'device_type',
    search_config: {
      operator: 'like',
    },
  },
  {
    header: 'Connection Types',
    accessorKey: 'connection_types',
    sortKey: 'device_services.protocol',
    search_config: {
      entity: 'device_services',
      field: 'protocol',
      operator: 'like',
    },
    cell: ({ row }) => {
      const raw = row?.original?.connection_types;
      // Group titles pass the grouped value as a scalar (e.g. "ui"), not an
      // array like normal rows — normalize so both shapes render.
      const types = Array.isArray(raw) ? raw : raw ? [raw] : [];
      if (types.length === 0) return null;
      const ORDER: Record<string, number> = { ssh: 0, tty: 1, ui: 2, rd: 3 };
      const sorted = [...types].sort(
        (a, b) => (ORDER[a] ?? 99) - (ORDER[b] ?? 99),
      );
      return sorted.map((t: string, index: number) => (
        <StatusCell key={index} value={String(t).toUpperCase()} renderType="value" />
      ));
    },
  },
  {
    header: 'Connection Status',
    accessorKey: 'is_device_online',
    enableSorting: true,
    sort_config: {
      type: 'boolean',
    },
    cell: ({ row }) => (
      <GridDeviceOnlineBadge online={row.original.is_device_online} />
    ),
  },
  {
    header: 'UUID',
    accessorKey: 'device_uuid',
    search_config: {
      operator: 'like',
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
    },
    cell: ({ row }) => {
      const raw = row?.original?.updated_date_time as string | undefined;
      if (!raw) return null;
      const parsed = moment.utc(raw, 'MM/DD/YYYY HH:mm');
      if (!parsed.isValid()) return <span>{raw}</span>;
      return <span>{parsed.local().format('MM/DD/YYYY HH:mm')}</span>;
    },
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
    sortKey: "created_date_time",
    search_config: {
      field: 'created_date_time',
      operator: 'like',
      custom_filter_field: 'created_date',
    },
    cell: ({ row }) => {
      const raw = row?.original?.created_date_time as string | undefined;
      if (!raw) return null;
      const parsed = moment.utc(raw, 'MM/DD/YYYY HH:mm');
      if (!parsed.isValid()) return <span>{raw}</span>;
      return <span>{parsed.local().format('MM/DD/YYYY HH:mm')}</span>;
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
