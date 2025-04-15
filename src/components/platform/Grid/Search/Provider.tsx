'use client';
import React, {
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '~/trpc/react';

import { UpdateReportFilter } from '../Action/UpdateReportFilter';
import { GridContext } from '../Provider';

import {
  type IAction,
  type ICreateContext,
  type ISearchItem,
  type ISearchItemResult,
  type ISearchParams,
  type IState,
} from './types';
import { clearAllSearchItems, removeSearchItems } from './utils/removeSearchItems';
import { resolveSearchItem } from './utils/resolveSearchItem';
import { useRouter } from 'next/navigation';

export const SearchGridContext = React.createContext<ICreateContext>({});

interface IProps extends PropsWithChildren {
  test?: any
}

export default function GridSearchProvider({ children }: IProps) {
  const router = useRouter();
  const { state: gridState } = useContext(GridContext);
  const {
    columns = [],
    entity: defaultEntity,
    searchableFields = [],
    searchConfig,
    onFetchRecords,
  } = gridState?.config ?? {};

  const { parentType, advanceFilter } = gridState ?? {};

  const { query_params } = searchConfig ?? {};
  const { group_advance_filters } = query_params ?? {};
  /** @STATES */
  const [_query, setQuery] = useState<string>('');
  const [searchItems, setSearchItems] = useState<ISearchItem[]>(
    gridState?.advanceFilter || [],
  ); 
  const [open, setOpen] = useState(false);

  const advanceFilterItems = useMemo(() => {
    const advanceFilter = searchItems.map(
      ({ entity, operator, type, field, values }) => ({
        entity: entity || defaultEntity,
        operator,
        type,
        field,
        values,
      }),
    ) as ISearchItem[];
    const searchResolver =  searchableFields.reduce(
      // eslint-disable-next-line no-unused-vars
      (acc: any, { accessorKey: _, ...item }: any, index) => {
        return [
          {
            type: 'criteria',
            operator: 'equal',
            values:
              item?.field === 'raw_phone_number'
                ? [_query?.replace(/[^\d]/g, '')]
                : [_query],
            // if entity is not provided, the default entity will be the entity of the grid
            entity: defaultEntity,
            ...item,
          },
          ...(index !== 0
            ? [{ type: 'operator', operator: 'or' }]
            : []),
          ...acc,
        ];
      },
      [
        ...(advanceFilter?.length
          ? [{ type: 'operator', operator: 'and' }]
          : []),
        ...advanceFilter,
      ],
    );
    return searchResolver;
  }, [_query, columns.length]);

  const handleQuery = (data: React.SetStateAction<string>) => {
    setQuery(data);
  };

  const handleOpen = (open: boolean) => {
    setOpen(open);
  };

  const handleSearchQuery = (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) => {
    const { router = 'grid', resolver = 'items' } = searchConfig ?? {};
    // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-unsafe-optional-chaining
    const { data } = api?.[router]?.[resolver].useQuery(search_params, options);
    return data;
  };

  const handleAddSearchItem = async (filterItem: ISearchItemResult) => {
    // eslint-disable-next-line no-unused-vars
    const { count: _, ...rest } = filterItem ?? {};
    const advanceFilter = searchItems.map(({ entity, ...rest }) => ({
      entity: entity || defaultEntity,
      ...rest,
    })) as ISearchItem[];
    setQuery('');
 
    const updateSearchItems = resolveSearchItem({
      advanceFilter,
      rest
    })
    setSearchItems(updateSearchItems);

    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      onFetchRecords?.({
        advance_filters: updateSearchItems,
      });
      return;
    }
    await UpdateReportFilter({
      filters: updateSearchItems,
      filterItemId: filterItem.id,
    });
    router.refresh()
  };
  const handleRemoveSearchItem = async (filterItem: ISearchItem) => {
    setQuery('');
    const updatedSearchItems = removeSearchItems(searchItems, filterItem);
    setSearchItems(updatedSearchItems);
    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      onFetchRecords?.({
        advance_filters: updatedSearchItems,
      });
      return;
    }
    await UpdateReportFilter({
      filters: updatedSearchItems,
      filterItemId: filterItem.id,
    });
    router.refresh()
  };

  const handleClearSearchItems = async () => {
    setQuery('');
    
    const defaultFilters = gridState?.defaultAdvanceFilter || [];
    const updatedSearchItems = clearAllSearchItems(defaultFilters);
    setSearchItems(updatedSearchItems);
    
    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      onFetchRecords?.({
        advance_filters: updatedSearchItems,
      });
      return;
    }

    await UpdateReportFilter({
      filters: updatedSearchItems,
    });

    router.refresh()
  };

  // @use effects
  useEffect(() => {
    setSearchItems(gridState?.advanceFilter || []);
    setQuery('');
  }, [gridState?.advanceFilter]);

  const state_context = {
    open,
    searchItems,
    query: _query,
    advanceFilterItems,
  } as IState;
  const actions = {
    handleQuery,
    handleOpen,
    handleSearchQuery,
    handleAddSearchItem,
    handleRemoveSearchItem,
    handleClearSearchItems,
  } as IAction;

  return (
    <SearchGridContext.Provider
      value={{
        state: state_context,
        actions,
      }}
    >
      {children}
    </SearchGridContext.Provider>
  );
}
