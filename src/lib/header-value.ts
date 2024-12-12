import { type Column } from "@tanstack/react-table";

const getHeaderValue = (column: Column<unknown>): string => {
  const header = column.columnDef.header;

  if (typeof header === "string") {
    return header;
  }

  return column.id;
};

export default getHeaderValue;
