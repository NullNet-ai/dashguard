"use client";

import { type ColumnDef } from "@tanstack/react-table";
import StatusCell from "~/components/ui/status-cell";

const gridColumns = [
  {
    header: "ID",
    accessorKey: "code",
  },
  {
    header: "Status",
    accessorKey: "position_status",
    enableResizing: false,
    cell: ({
      // ? You can use get Value to get the value of the cell
      // getValue,
      // ? You can use row to get the row data ( row.original )
      row,
    }) => {
      // ? You can use the row to get the original data
      // ? But make sure to check if the row is not null
      const value = row?.original?.position_status;
      if (!value) return null;
      return <StatusCell value={value} />;
    },
  },
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Activation Date",
    accessorKey: "activation_date",
  },
  {
    header: "Expiration Date",
    accessorKey: "expiration_date",
  },
  {
    header: "Status",
    accessorKey: "status",
    enableResizing: false,
    cell: ({
      // ? You can use get Value to get the value of the cell
      // getValue,
      // ? You can use row to get the row data ( row.original )
      row,
    }) => {
      // ? You can use the row to get the original data
      // ? But make sure to check if the row is not null
      const value = row?.original?.status;
      return <StatusCell value={value} />;
    },
  },
  {
    header: "Created At",
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
  // {
  //   header: "Created By",
  //   accessorKey: "",
  // },
  {
    header: "Updated At",
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
  // {
  //   header: "Updated By",
  //   accessorKey: "",
  // },
  // {
  //   id: "action",
  //   size: 1,
  //   enableResizing: false,
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     const status = row?.original?.status;
  //     const id = row?.original?.id;
  //     const handleEdit = async () => {
  //       if (!id) return;
  //       await Edit({
  //         entity: "organizations",
  //         id: row.original?.id,
  //         status: row.original?.status,
  //       });
  //     };
  //     const handleArchive = async () => {
  //       if (!row.original?.id) return;
  //       await Archive({ entity: "organizations", id: row.original?.id });
  //     };
  //     const handleActivate = () => {

  //     };

  //     return (
  //       <div>
  //         <button onClick={handleEdit}>Edit</button>
  //         {status?.toLowerCase() === "archive" ? (
  //           <button onClick={handleActivate}>Activate</button>
  //         ) : (
  //           <button onClick={handleArchive}>Archive</button>
  //         )}
  //       </div>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: true,
  // },
] as ColumnDef<any>[];

export default gridColumns;

// ? You can add columns to hide when mobile view as per your requirement just copy the respective accessorKey from the gridColumns
export const TO_HIDE_COLUMNS_WHEN_MOBILE = [];
