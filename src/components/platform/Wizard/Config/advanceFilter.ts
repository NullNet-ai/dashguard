import { SortingState } from "@tanstack/react-table";
import { ulid } from "ulid";
import { ISearchItem } from "~/components/platform/Grid/Search/types";

export const defaultAdvanceFilter = [
  {
    entity: "contacts",
    operator: "equal",
    type: "criteria",
    field: "status",
    id: ulid(),
    label: "Status",
    values: ["Active", "Draft"],
    default: true,
  }
] as ISearchItem[];
