import { EOrderDirection } from "@dna-platform/common-orm";
import { SortingState } from "@tanstack/react-table";

export const formatSorting = (sorting: SortingState) => {
  return sorting.map((sort: any) => {
    return {
      by_field: sort.sort_key || sort.id,
      by_direction: sort.desc ? EOrderDirection.DESC : EOrderDirection.ASC,
    };
  });
};
