import { formatAndCapitalize } from "~/lib/utils";
import { ISearchableField } from "../types";
import { ulid } from "ulid";

export const transformSearchData = (
  array: Record<string, any>[] | undefined,
  searchText: string,
  searchableFields: ISearchableField[],
) => {
  if (!array) return null;

  const transformedData = array.reduce((acc: any, obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      const searchableField = searchableFields.find(
        (field) => field.field === key,
      );
      const isTextFound =
        searchableField?.operator === "contains"
          ? (value as any)?.includes(searchText)
          : value === searchText
      if (isTextFound) {
        acc.push({
          id: ulid(),
          field: key,
          values: Array.isArray(value) ? value : [value],
          operator: "equal",
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
    const key = `${result.field}_${JSON.stringify(result.values)}`;
    if (!consolidated[key]) {
      consolidated[key] = { ...result, count: 1 };
    } else {
      consolidated[key].count++;
    }
  });
  const searchResults = Object.values(consolidated) || null;
  return searchResults;
};
