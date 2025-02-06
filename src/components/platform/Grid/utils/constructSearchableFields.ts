import { ColumnDef } from "@tanstack/react-table";
import { ISearchableField } from "../Search/types";

export const constructSearchableFields = ({columns, entity}: {columns: ColumnDef<any>[], entity: string}) => {
	if(!columns.length || !entity) return [];
  const seachableFields = columns.map((column) => {
		const { isSearchable = true, accessorKey, search_config, header } = column as any;
    if (isSearchable && accessorKey && header) {
      return {
        accessorKey,
        field: accessorKey,
        label: header,
        entity,
        operator: "like",
        ...(search_config ?? {}),
      } as ISearchableField;
    }
  });
	return seachableFields.filter(Boolean) as ISearchableField[];
};
