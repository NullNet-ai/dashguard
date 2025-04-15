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

export const calculateMainTabItems = (items: any[], containerWidth: number, defaultName: string, alwaysFirst?: string) => {
  // Make a copy of the items to avoid modifying the original

  const entity_name = defaultName

  const result = [...items];
  
  // Find the active item (using current key instead of active)
  const activeItem = result.find(item => item.current);
  


  // Ensure "All contact" is never hidden
  result.forEach(item => {
    if (item.name?.toLowerCase() === entity_name) {
      item.hidden = false;
    }
  });


  
  // If active item is hidden, we need to make it visible
  if (activeItem && activeItem.hidden) {
      // Make active item visible
      activeItem.hidden = false;
      
      // Calculate total width of visible items using metadata.item_width
      let visibleWidth = result
          .filter(item => !item.hidden)
          .reduce((sum, item) => sum + (item.metadata?.item_width || 0), 0);
      
      // If total width exceeds container, hide non-active items until it fits
      if (visibleWidth > containerWidth) {
          // Sort non-active visible items by priority (you can change this logic)
          const nonActiveVisibleItems = result
              .filter(item => !item.current && !item.hidden && item.name?.toLowerCase() !== entity_name)
              .sort((a, b) => (b.metadata?.item_width || 0) - ((a.metadata?.item_width) || 0)); // Hide widest items first
          
          // Hide items until we fit
          for (const item of nonActiveVisibleItems) {
              if (visibleWidth > containerWidth) {
                  item.hidden = true;
                  visibleWidth -= (item.metadata?.item_width || 0);
              } else {
                  break;
              }
          }
      }
  }
  
  // Sort the result by hidden property (not hidden first, then hidden)
  // and then by order if available, but ensure "all contact" is always first
  result.sort((a, b) => {
      // Check if either item is "all contact" (case insensitive)
      const aIsAllContact = a.name?.toLowerCase() === entity_name;
      const bIsAllContact = b.name?.toLowerCase() === entity_name;
      
      // If one is "all contact", it comes first
      if (aIsAllContact && !bIsAllContact) return -1;
      if (!aIsAllContact && bIsAllContact) return 1;
      
      // If neither or both are "all contact", sort by hidden status
      if (a.hidden !== b.hidden) {
          return a.hidden ? 1 : -1;
      }
      
      // Then sort by order if both have the same hidden status
      return (a.order || 0) - (b.order || 0);
  });
  
  return result;
}