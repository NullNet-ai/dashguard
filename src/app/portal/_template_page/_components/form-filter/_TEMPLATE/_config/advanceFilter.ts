import { headers } from "next/headers";
import { ulid } from "ulid";
import { ISearchItem } from "~/components/platform/Grid/Search/types";
const headerList = headers();
const pathname = headerList.get("x-pathname") || "";
const entity = pathname.split("/")[2];

// ** This is initial advance filter for the <entity> module

const defaultAdvanceFilter = [
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

export default defaultAdvanceFilter;
