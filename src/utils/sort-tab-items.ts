import { toLower } from 'lodash';

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

export const reorderShowActiveItem = (items: any[], activeName: string, application: string) => {
  // Return original items if application is grid
  if (toLower(application) === 'grid') {
    return [...items];
  }

  const result = [...items];
  
  // Find active item
  const activeIndex = result.findIndex(item => item.name === activeName);
  if (activeIndex === -1) return result;
  
  const activeItem = result[activeIndex];
  
  // If active item is already visible, just return
  if (!activeItem.hidden) {
    return result;
  }

  // Get visible items (excluding Grid)
  const visibleItems = result.filter(item => !item.hidden && item.name !== 'Grid');
  
  // Get last visible item position
  const lastVisibleIndex = result.findIndex(item => item === visibleItems[visibleItems.length - 1]);
  
  // Make active item visible and last visible item hidden
  activeItem.hidden = false;
  if (lastVisibleIndex !== -1) {
    result[lastVisibleIndex].hidden = true;
  }
  
  // Remove active item from current position
  result.splice(activeIndex, 1);
  
  // Insert after last visible item
  result.splice(lastVisibleIndex, 0, activeItem);

  return result;
}