import { ulid } from 'ulid';

import { type ISearchItem } from '../types';

export const resolveSearchItem = ({
  advanceFilter,
  filter_item,
}: {
  advanceFilter: ISearchItem[];
  filter_item: ISearchItem;
}) => {
  const hasFilters = advanceFilter.some(
    (item) => item.filters && item.filters.length > 0,
  );

  const resolveFilterItem = {
    ...filter_item,
    id: ulid(),
    values:
      filter_item?.field === 'raw_phone_number'
        ? [filter_item?.values?.[0]?.replace(/[^\d]/g, '')]
        : filter_item?.values,
    display_value: filter_item.display_value
      ? filter_item.display_value
      : filter_item?.values?.[0],
    operator: 'equal',
    // filter_item?.operator === 'like' && !filter_item?.parse_as ? 'equal' : filter_item?.operator,
    default: false,
    
  };
  if (hasFilters) {
    const searchItemResolver = advanceFilter.map((item: any) => {
      if (item.filters) {
        return {
          ...item,
          filters: [
            ...item.filters,
            {
              type: 'operator',
              operator: 'and',
              entity: filter_item?.entity,
              default: false,
            },
            resolveFilterItem, // Corrected this part
          ],
        };
      }
      return item; // Keep "operator" objects unchanged
    }) as ISearchItem[];
    return searchItemResolver;
  }

  // If `filters` key exists, preserve nested structure
  const searchItemResolver = [
    ...advanceFilter,
    ...(advanceFilter.length
      ? [{ type: 'operator', operator: 'and', default: false }]
      : []),
    {
      ...resolveFilterItem,
    },
  ] as ISearchItem[];

  return searchItemResolver;
};
