import { ISearchItem } from '../types';

export const removeSearchItems = (
  searchItems: ISearchItem[],
  filterItem: ISearchItem,
) => {
  const hasFilters = searchItems[0]?.filters?.length ?? 0 > 0;

  if (hasFilters) {
    // Find the group that contains the filter we want to remove
    // Iterate through searchItems to find and remove the filter and related operators
    searchItems.forEach((group, groupIndex) => {
      if (group.filters) {
        const filterIndex = group.filters.findIndex(
          (filter) =>
            filter.type === 'criteria' &&
            filter.field === filterItem.field &&
            filter.default === false &&
            JSON.stringify(filter.values) === JSON.stringify(filterItem.values),
        );

        if (filterIndex !== -1) {
          // Check if there's an operator before this filter inside the filters array
          if (
            filterIndex > 0 &&
            group.filters[filterIndex - 1]?.type === 'operator'
          ) {
            group.filters.splice(filterIndex - 1, 2); // Remove both operator and filter
          } else {
            group.filters.splice(filterIndex, 1); // Just remove the filter
          }

          // If the `filters` array is empty after removal, remove the entire group
          if (group.filters.length === 0) {
            searchItems.splice(groupIndex, 1);

            // If the previous item in `searchItems` is an operator, remove it too
            if (
              groupIndex > 0 &&
              searchItems[groupIndex - 1]?.type === 'operator'
            ) {
              searchItems.splice(groupIndex - 1, 1);
            }
          }
        }
      }
    });
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
      item.default === filterItem.default,
  );

  if (index !== -1) {
    // Remove the preceding "and" operator if present
    if (
      index > 0 &&
      searchItems[index - 1]?.type === 'operator' &&
      searchItems[index - 1]?.operator === 'and'
    ) {
      searchItems.splice(index - 1, 2);
    } else {
      searchItems.splice(index, 1);
    }
  }

  return searchItems;
};

export const clearAllSearchItems = (searchItems: ISearchItem[]): ISearchItem[] => {
  if (!searchItems?.length) return [];

  // Process groups with nested filters
  return searchItems.reduce((acc: ISearchItem[], group: ISearchItem, index: number) => {
    if (group.filters?.length) {
      // Keep only default filters
      const defaultFilters = group.filters.filter(filter => filter.default === true);
      
      if (defaultFilters.length) {
        // If we have default filters, keep the group
        acc.push({
          ...group,
          filters: defaultFilters
        });

        // If there's a next group and current group has default filters
        // keep the operator between groups
        if (
          index < searchItems.length - 1 && 
          searchItems[index + 1]?.type === 'operator'
        ) {
          acc.push(searchItems[index + 1] as ISearchItem);
        }
      }
    } else if (group.default === true) {
      // Handle non-nested default items
      acc.push(group);
    }
    
    return acc;
  }, []);
};
