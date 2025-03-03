export const reorderItems = (items: any[], previousActiveItem: any, targetName: string) => {
  const result = [...items];

  const targetIndex = result.findIndex(item => item.name === targetName);
  if (targetIndex !== -1) {
    const targetItem = result.splice(targetIndex, 1)[0];
    targetItem.hidden = false;
    targetItem.current = true;

    // Find and remove previous active item if exists
    const prevActiveIndex = result.findIndex(item => item.name === previousActiveItem?.name);
    if (prevActiveIndex !== -1) {
      result.splice(prevActiveIndex, 1);
    }

    const visibleItems = result.filter(item => !item.hidden);

    if (visibleItems.length > 0) {
      const lastVisibleItem = visibleItems[visibleItems.length - 1];
      lastVisibleItem.hidden = true;
    }

    result.splice(1, 0, targetItem);
    result.splice(2, 0, previousActiveItem);
  }

  return result;
}
