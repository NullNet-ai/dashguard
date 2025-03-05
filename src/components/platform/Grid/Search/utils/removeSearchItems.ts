import { ISearchItem } from "../types";

export const removeSearchItems = (
  searchItems: ISearchItem[],
  filterItem: ISearchItem,
) => {
  const index = searchItems.findIndex(
    (item) =>
      item.entity === filterItem.entity &&
      item.operator === filterItem.operator &&
      item.type === filterItem.type &&
      item.field === filterItem.field &&
      JSON.stringify(item.values) === JSON.stringify(filterItem.values) &&
      item.default === filterItem.default
  );
  
  // Remove filterItem and its preceding "and" operator
  if (index !== -1) {
    if (index > 0 && searchItems?.[index - 1]?.operator === "and" && searchItems?.[index - 1]?.type === "operator") {
      searchItems.splice(index - 1, 2); // Remove the "and" operator and filterItem
    } else {
      searchItems.splice(index, 1); // Just remove the filterItem
    }
  }

  return searchItems;
};
