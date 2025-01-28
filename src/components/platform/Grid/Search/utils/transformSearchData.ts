import { formatAndCapitalize } from "~/lib/utils";
import { ISearchableField } from "../types";
import { ulid } from "ulid";

export const transformSearchData = (
  items: Record<string, any>[] | undefined,
  searchText: string,
  searchableFields: ISearchableField[],
) => {
  if (!items) return null;

  const transformedData = items.reduce((acc: any, obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      const searchableField = searchableFields.find(
        (field) => field.accessorKey === key,
      );
      const isTextFound = ["contains", "like"].includes(
        searchableField?.operator || "",
      )
        ? (value as any)?.includes(searchText)
        : value === searchText;
      if (isTextFound) {
        acc.push({
          id: ulid(),
          field: key,
          values: [searchText],
          operator: searchableField?.operator || "equal",
          type: "criteria",
          label: searchableField?.label || formatAndCapitalize(key),
          ...searchableField,
        });
      }
    }
    return acc;
  }, []);
  const consolidated: Record<string, any> = {};
  transformedData.forEach((result: any) => {
    const key = `${result.field}_${JSON.stringify(result.values)}_${result.entity}`;
    if (!consolidated[key]) {
      consolidated[key] = { ...result, count: 1 };
    } else {
      consolidated[key].count++;
    }
  });
  const searchResults = Object.values(consolidated) || null;
  return searchResults;
};
