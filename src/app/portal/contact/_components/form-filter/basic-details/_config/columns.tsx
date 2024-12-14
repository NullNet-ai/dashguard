"use client";

import { type ColumnDef } from "@tanstack/react-table";
import StatusCell from "~/components/ui/status-cell";

const gridColumns = [
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
    header: "Code",
    accessorKey: "code",
  },
  {
    header: "Category",
    accessorKey: "categories",
    enableResizing: false,
    cell: ({ row }) => {
      const categories = row?.original?.categories || [];
      return categories?.map((category: string, index: number) => {
        return <StatusCell key={index} value={category} />;
      });
    },
  },
  {
    header: "First Name",
    accessorKey: "first_name",
  },
  {
    header: "Middle Name",
    accessorKey: "middle_name",
  },
  {
    header: "Last Name",
    accessorKey: "last_name",
  },
  {
    header: "Primary Phone No.",
    accessorKey: "raw_phone_number",
  },
  {
    header: "Primary Email",
    accessorKey: "email",
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
    header: "Updated by",
    accessorKey: "updated_by",
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
  {
    header: "Created by",
    accessorKey: "created_by",
  },
] as ColumnDef<any>[];

export default gridColumns;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
export const FIELD_FILTER_GRID_COLUMNS = [
  "status",
  "code",
  "categories",
  "first_name",
  "middle_name",
  "last_name",
  "raw_phone_number",
  "email",
];
