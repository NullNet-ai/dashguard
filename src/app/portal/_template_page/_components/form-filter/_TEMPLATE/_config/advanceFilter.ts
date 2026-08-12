import { headers } from "next/headers";
import { ulid } from "ulid";
import { ISearchItem } from "~/components/platform/Grid/Search/types";

// ** This is initial advance filter for the <entity> module
// Note: This function needs to be called from an async context
export const getDefaultAdvanceFilter = async () => {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const entity = pathname.split("/")[2];

  return [
    {
      entity: entity,
      operator: "equal",
      type: "criteria",
      field: "status",
      id: ulid(),
      label: "Status",
      values: ["Active"],
      default: true,
    },
    {
      operator: "or",
      type: "operator",
      default: true,
    },
    {
      entity: entity,
      operator: "equal",
      type: "criteria",
      field: "status",
      id: ulid(),
      label: "Status",
      values: ["Draft"],
      default: true,
    },
    {
      operator: "or",
      type: "operator",
      default: true,
    },
    {
      entity: entity,
      operator: "equal",
      type: "criteria",
      field: "status",
      id: ulid(),
      label: "Status",
      values: ["Archived"],
      default: true,
    },
  ] as ISearchItem[];
};

// For backward compatibility, export a default that needs to be called
const defaultAdvanceFilter = [] as ISearchItem[];
export default defaultAdvanceFilter;
