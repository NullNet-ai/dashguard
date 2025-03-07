export function sortColumns(
  gridOrders: any[],
  gridColumns: any[]
) {


  const orderMap = new Map(gridOrders.map(item => [item.accessorKey, item]));

  // Filter out columns that are not `isShow: true`
  const filteredGridColumns = gridColumns.filter(col => orderMap.get(col.accessorKey)?.isShow);
  
  // Sort based on `order`
  const sortedGridColumns = filteredGridColumns.sort((a, b) => {
    const orderA = orderMap.get(a.accessorKey)?.order ?? Infinity;
    const orderB = orderMap.get(b.accessorKey)?.order ?? Infinity;
    return orderA - orderB;
  });

  return sortedGridColumns
}