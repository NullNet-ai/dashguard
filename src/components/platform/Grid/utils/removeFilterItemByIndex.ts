import { type ISearchItem } from '../Search/types'

export const removeFilterItemByIndex = (
  filterItems: ISearchItem[],
  indexToRemove: number,
) => {
  if (filterItems && Array.isArray(filterItems)) {
    const itemToRemove = filterItems[indexToRemove]
    const indicesToRemove = [indexToRemove]

    // If removing a criteria item, also remove its associated operator
    if (itemToRemove?.type === 'criteria') {
      // Check if the next item is an operator
      if (
        indexToRemove + 1 < filterItems.length
        && filterItems[indexToRemove + 1]?.type === 'operator'
      ) {
        indicesToRemove.push(indexToRemove + 1)
      }
      // Check if the previous item is an operator (for the first criteria)
      else if (
        indexToRemove > 0
        && filterItems[indexToRemove - 1]?.type === 'operator'
      ) {
        indicesToRemove.push(indexToRemove - 1)
      }
    }
    // If removing an operator, also remove its associated criteria
    else if (itemToRemove?.type === 'operator') {
      // Check if the next item is a criteria
      if (
        indexToRemove + 1 < filterItems.length
        && filterItems[indexToRemove + 1]?.type === 'criteria'
      ) {
        indicesToRemove.push(indexToRemove + 1)
      }
      // Check if the previous item is a criteria
      else if (
        indexToRemove > 0
        && filterItems[indexToRemove - 1]?.type === 'criteria'
      ) {
        indicesToRemove.push(indexToRemove - 1)
      }
    }

    // Sort indices in descending order to remove from end to beginning
    indicesToRemove.sort((a, b) => b - a)

    // Remove items by filtering out the indices
    const updatedFilterItems = filterItems.filter(
      (_, index) => !indicesToRemove.includes(index),
    )

    return updatedFilterItems
  }
}
