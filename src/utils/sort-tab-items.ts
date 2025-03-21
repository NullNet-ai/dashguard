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

export const reorderMainTabActive = (items: any[], activeName: string, entity: string) => {
  // Return original items if entity is dashboard
  if (toLower(entity) === 'dashboard') {
    const result = [...items];
    // Check for dashboard tab and ensure it's first
    const dashboardIndex = result.findIndex(item => toLower(item.name) === 'dashboard');
    if (dashboardIndex !== -1) {
      const dashboardItem = result.splice(dashboardIndex, 1)[0];
      result.unshift(dashboardItem); // Put dashboard at first position
    }
    return result;
  }

  const result = [...items];
  
  // Check for dashboard tab and ensure it's first
  const dashboardIndex = result.findIndex(item => toLower(item.name) === 'dashboard');
  if (dashboardIndex !== -1) {
    const dashboardItem = result.splice(dashboardIndex, 1)[0];
    result.unshift(dashboardItem); // Put dashboard at first position
  }
  
  // Find active item
  const activeIndex = result.findIndex(item => item.name === activeName);
  if (activeIndex === -1) return result;
  
  const activeItem = result[activeIndex];
  
  // If active item is already visible, just return
  if (!activeItem.hidden) {
    return result;
  }

  // Get visible items (excluding dashboard)
  const visibleItems = result.filter(item => !item.hidden && toLower(item.name) !== 'dashboard');
  
  // Get last visible item position
  const lastVisibleIndex = result.findIndex(item => item === visibleItems[visibleItems.length - 1]);
  
  // Make active item visible and last visible item hidden
  activeItem.hidden = false;
  if (lastVisibleIndex !== -1) {
    result[lastVisibleIndex].hidden = true;
  }
  
  // Remove active item from current position
  result.splice(activeIndex, 1);
  
  // Insert after last visible item but after dashboard
  result.splice(Math.max(1, lastVisibleIndex), 0, activeItem);

  return result;
}

export const reorderGridTabActive = (items: any[], activeName: string, entity: string) => {
  // Return original items if application is grid
  if (toLower(entity) === 'all contact') {
    return [...items];
  }

  const result = [...items];
  
  // Find active item
  const activeIndex = result.findIndex(item => item.id === activeName);

  if (activeIndex === -1) return result;
  
  const activeItem = result[activeIndex];
  
  // If active item is already visible, just return
  if (!activeItem.hidden) {
    return result;
  }

  // Get visible items (excluding Grid)
  const visibleItems = result.filter(item => !item.hidden && item.name !== 'dashboard');
  
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