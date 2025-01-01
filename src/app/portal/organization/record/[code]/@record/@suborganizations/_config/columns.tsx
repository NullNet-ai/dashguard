"use client";

import { type ColumnDef } from "@tanstack/react-table";
import StatusCell from "~/components/ui/status-cell";

const gridColumns = [
  {
    header: "ID",
    accessorKey: "code",
  },
  {
    header: "Name",
    accessorKey: "name",
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
    accessorKey: "",
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
    accessorKey: "",
  },
  // {
  //   id: "action",
  //   size: 1,
  //   enableResizing: false,
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     const { original } = row;
  //     const { id, name, status } = original;
  //     // const handleEdit = async () => {
  //     //   if (!id) return;
  //     //   await Edit({
  //     //     row,
  //     //     config: row.original,
  //     //     // entity: "organizations",
  //     //     // id: row.original?.id,
  //     //     // status: row.original?.status,
  //     //   });
  //     // };
  //     const handleArchive = async () => {
  //       if (!row.original?.id) return;
  //       await Archive({ row, config: row.original });
  //     };
  //     const handleActivate = () => {};

  //     return (
  //       <div>
  //         {/* <button onClick={handleEdit}>Edit</button> */}
  //         {/* {status?.toLowerCase() !== "archive" ||
  //         name === "global-organization" ? (

  //         ) : (

  //         )} */}{" "}
  //         <button onClick={handleActivate}>Edit</button>
  //         <button onClick={handleArchive}>Archived</button>
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
