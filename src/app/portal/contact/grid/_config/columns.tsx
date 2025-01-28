"use client";

import { type ColumnDef } from "@tanstack/react-table";
import StatusCell from "~/components/ui/status-cell";

// ? This is initial grid columns for the <entity> module
// ? You can add or remove columns as per your requirement
const gridColumns = [
  {
    header: "State",
    accessorKey: "status",
    enableResizing: false,
    cell: ({ row }) => {
      const value = row?.original?.status;
      return <StatusCell value={value} />;
    },
  },
  {
    header: "ID",
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
    search_config: {
      operator: "contains"
    }
  },
  {
    header: "First Name",
    accessorKey: "first_name",
  },
  {
    header: "Last Name",
    accessorKey: "last_name",
  },
  {
    header: "Middle Name",
    accessorKey: "middle_name",
  },
  {
    header: "Primary Phone Number",
    accessorKey: "raw_phone_number",
    sortKey: "contact_phone_number.raw_phone_number",
    search_config: {
      entity: "contact_phone_numbers"
    }
  },
  {
    header: "Primary Email",
    accessorKey: "email",
    sortKey: "contact_email.email",
    search_config: {
      entity: "contact_emails"
    }
  },
  {
    header: "Primary Organization",
    accessorKey: "organization",
    isSearchable: false,
  },
  {
    header: "Roles",
    accessorKey: "roles",
    enableResizing: false,
    isSearchable: false,
    cell: ({ row }) => {
      const roles = row?.original?.roles || [];
      return roles?.map((role: string, index: number) => {
        return <StatusCell key={index} value={role} />;
      });
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
    header: "Updated By",
    accessorKey: "updated_by",
    sortKey: "updated_by.first_name",
    search_config: {
      entity: "updated_by",
      field: "first_name",
      operator: 'like'
    }
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
    header: "Created By",
    accessorKey: "created_by",
    sortKey: "created_by.first_name",
    search_config: {
      entity: "created_by",
      field: "first_name",
      operator: 'like'
    }
  }
] as ColumnDef<any>[];

export default gridColumns;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
