import { EOrderDirection } from "@dna-platform/common-orm";
import { SortingState } from "@tanstack/react-table";

export const formatSorting = (sorting: SortingState, main_entity: string, is_case_sensitive_sorting?: string) => {
  return sorting.map((sort: any) => {
    const { id, sort_key, desc } = sort || {};
    const field = sort_key?.split(".");
    const by_field = field?.length >= 2 ? sort_key : `${main_entity}.${sort_key || id}`;
    return {
      by_field: by_field,
      by_direction: desc ? EOrderDirection.DESC : EOrderDirection.ASC,
      is_case_sensitive_sorting,
    };
  });
};
