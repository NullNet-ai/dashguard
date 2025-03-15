import { ISearchItem } from "../types";

export const removeSearchItems = (searchItems: ISearchItem[], filterItem: ISearchItem) => {
  const hasFilters = searchItems[0]?.filters?.length ?? 0 > 0;

  if (hasFilters) {
    // Find the group that contains the filter we want to remove
    const groupIndex = searchItems.findIndex((item) => 
      item.filters?.some((filter) => 
        filter.id === filterItem.id &&
        filter.field === filterItem.field &&
        JSON.stringify(filter.values) === JSON.stringify(filterItem.values)
      )
    );

    if (groupIndex !== -1) {
      // If we found the group containing our filter
      if (groupIndex > 0 && searchItems[groupIndex - 1]?.type === "operator") {
        // Remove both the operator and the group containing the filter
        searchItems.splice(groupIndex - 1, 2);
      } else {
        // Just remove the group containing the filter
        searchItems.splice(groupIndex, 1);
      }
    }

    return searchItems;
  }

  // Handle non-nested filters (root level)
  const index = searchItems.findIndex(
    (item) =>
      item.entity === filterItem.entity &&
      item.operator === filterItem.operator &&
      item.type === filterItem.type &&
      item.field === filterItem.field &&
      JSON.stringify(item.values) === JSON.stringify(filterItem.values) &&
      item.default === filterItem.default
  );

  if (index !== -1) {
    // Remove the preceding "and" operator if present
    if (index > 0 && searchItems[index - 1]?.type === "operator" && searchItems[index - 1]?.operator === "and") {
      searchItems.splice(index - 1, 2);
    } else {
      searchItems.splice(index, 1);
    }
  }

  return searchItems;
};
