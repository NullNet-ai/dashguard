import { ulid } from "ulid";
import { type ISearchItem } from "~/components/platform/Grid/Search/types";

export const defaultAdvanceFilter = [
  {
    entity: "organizations",
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
    entity: "organizations",
    operator: "equal",
    type: "criteria",
    field: "status",
    id: ulid(),
    label: "Status",
    values: ["Draft"],
    default: true,
  }
] as ISearchItem[];
