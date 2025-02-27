export function sortColumns(
  gridOrders: any[],
  gridColumns: any[]
) {
  const orderMap = new Map(gridOrders.map((item, index) => [item.accessorKey, item.order ?? index]));

  const sortedGridColumns = [...gridColumns].sort((a, b) => {
    const orderA = orderMap.has(a.accessorKey) ? orderMap.get(a.accessorKey)! : Infinity;
    const orderB = orderMap.has(b.accessorKey) ? orderMap.get(b.accessorKey)! : Infinity;
    return orderA - orderB;
  });

  return sortedGridColumns;
}