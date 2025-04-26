"use client";

import { type ColumnDef } from "@tanstack/react-table";
import StatusCell from "~/components/ui/status-cell";

const GRID_COLUMNS = [
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
    header: "Updated Date",
    accessorKey: "updated_date",
    cell: ({ row }) => {
      const date = row?.original?.updated_date;
      const time = row?.original?.updated_time;
      return (
        <div className="flex items-center gap-x-2">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      );
    },
  },
  {
    header: "Created Date",
    accessorKey: "created_date",
    cell: ({ row }) => {
      const date = row?.original?.created_date;
      const time = row?.original?.created_time;
      return (
        <div className="flex items-center gap-x-2">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      );
    },
  },
] as ColumnDef<any>[];

export default GRID_COLUMNS;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
export const FIELD_FILTER_GRID_COLUMNS = [
  "code",
  "email",
  "status",
];
