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
