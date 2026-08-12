import { type ISearchItem } from '../types';

export const resolveAdvanceFilter = ({
  currentAdvanceFilter,
  additionalFilter,
}: {
  currentAdvanceFilter: ISearchItem[];
  additionalFilter: ISearchItem[];
}) => {
  const hasFilters = currentAdvanceFilter.some(
    (item) => item.filters && item.filters.length > 0,
  );

  if (hasFilters) {
    const searchItemResolver = currentAdvanceFilter.map((item: any) => {
      if (item.filters) {
        return {
          ...item,
          filters: [
            ...item.filters,
            ...(additionalFilter?.length
              ? [
                  {
                    type: 'operator',
                    operator: 'and',
                  },
                ]
              : []),
            ...additionalFilter,
          ],
        };
      }
      return item;
    }) as ISearchItem[];
    return {
      group_advance_filters: searchItemResolver,
      advance_filters: [],
    };
  }

  const searchItemResolver = [
    ...currentAdvanceFilter,
    ...(additionalFilter.length && currentAdvanceFilter.length
      ? [{ type: 'operator', operator: 'and', default: false }]
      : []),
    ...additionalFilter,
  ] as ISearchItem[];

  return {
    group_advance_filters: [],
    advance_filters: searchItemResolver,
  };
};
