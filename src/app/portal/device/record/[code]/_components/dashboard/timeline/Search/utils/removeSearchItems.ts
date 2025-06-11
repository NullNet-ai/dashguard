import { type ISearchItem } from '../types'

export const removeSearchItems = (
  searchItems: ISearchItem[],
  filterItem: ISearchItem,
) => {
  const data = [...searchItems]
  const index = data.findIndex((item: ISearchItem) => item.id !== undefined && item.id === filterItem.id)
  if (index === -1) return data
  if (index === 0) {
    // If removing `a`, also remove `b` (even + adjacent odd)
    data.splice(0, 2)
  }
  else if (index % 2 === 0) {
    // If removing an even-positioned item (like `c` or `e`)
    data.splice(index - 1, 2) // Remove the item and its preceding odd-positioned item
  }

  return data
}

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