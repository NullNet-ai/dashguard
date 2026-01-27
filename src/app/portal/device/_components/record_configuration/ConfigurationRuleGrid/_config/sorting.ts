import { SortingState } from "@tanstack/react-table";

export const defaultSorting = [
  {
    id: "interface",
    desc: true,
  },
  {
    id: "order",
    desc: false,
  },
] as SortingState;
