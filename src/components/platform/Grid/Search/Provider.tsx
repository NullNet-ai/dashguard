'use client';
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { api } from '~/trpc/react';

import { UpdateReportFilter } from '../Action/UpdateReportFilter';
import { GridContext } from '../Provider';

import { useRouter } from 'next/navigation';
import {
  type IAction,
  type ICreateContext,
  type ISearchItem,
  type ISearchItemResult,
  type ISearchParams,
  type IState,
} from './types';
import {
  clearAllSearchItems,
  removeSearchItems,
} from './utils/removeSearchItems';
import { resolveSearchItem } from './utils/resolveSearchItem';
import { useQuery } from '@tanstack/react-query';

export const SearchGridContext = React.createContext<ICreateContext>({});

interface IProps extends PropsWithChildren {
  test?: any;
}

export default function GridSearchProvider({ children }: IProps) {
  const router = useRouter();
  const { state: gridState } = useContext(GridContext);
  const {
    columns = [],
    entity: defaultEntity,
    searchableFields = [],
    searchConfig,
    searchSuggestionConfig,
    onFetchRecords,
  } = gridState?.config ?? {};

  const { parentType, gridKey } = gridState ?? {};

  const { query_params } = searchSuggestionConfig ?? {};
  const { group_advance_filters } = query_params ?? {};
  /** @STATES */
  const [_query, setQuery] = useState<string>('');
  const [searchItems, setSearchItems] = useState<ISearchItem[]>(
    gridState?.advanceFilter || [],
  );
  const [open, setOpen] = useState(false);

  const { router: searchRouter = 'search', resolver = 'searchSuggestions' } =
    searchSuggestionConfig ?? {};
  // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
  const searchMutation = api?.[searchRouter]?.[resolver].useMutation();

  const advanceFilterItems = useMemo(() => {
    const advanceFilter = searchItems.map(
      ({ entity, operator, type, field, values, parse_as }) => ({
        entity: entity || defaultEntity,
        operator,
        type,
        field,
        values,
        ...(parse_as ? { parse_as } : {}),
      }),
    ) as ISearchItem[];
    const searchResolver = searchableFields.reduce(
      // eslint-disable-next-line no-unused-vars
      (acc: any, { accessorKey: _, ...item }: any, index) => {
        const resolveValue =
          item?.field === 'raw_phone_number'
            ? _query?.replace(/[^\d]/g, '')
            : _query;

        if (!resolveValue) return acc;
        return [
          {
            type: 'criteria',
            operator: 'equal',
            values: [resolveValue],
            entity: defaultEntity,
            ...item,
            is_search: true,
          },
          ...(index !== 0 ? [{ type: 'operator', operator: 'or' }] : []),
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
    const data = useQuery({
      queryKey: ['search', _query], // cache per searchText
      queryFn: () => searchMutation.mutateAsync(search_params),
      ...options,
      enabled: Boolean(_query),
    });

    return data;
  };

  // TODO: Remove this function after the new search is implemented in form filter
  const handleOldSearchQuery = (
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
    const { count: _, parse_as, ...filter_item } = filterItem ?? {};
    const advanceFilter = searchItems.map(({ entity, ...rest }) => ({
      entity: entity || defaultEntity,
      ...rest,
    })) as ISearchItem[];
    setQuery('');

    const updateSearchItems = resolveSearchItem({
      advanceFilter,
      filter_item,
    });
    setSearchItems(updateSearchItems);
    const updatedFilterUrl = await UpdateReportFilter({
      filters: updateSearchItems,
      gridKey,
    });

    if (onFetchRecords) {
      onFetchRecords?.({
        advance_filters: updateSearchItems,
      });
      return;
    }
    if (updatedFilterUrl) {
      router.push(updatedFilterUrl);
      return;
    } else {
      router.refresh();
    }
  };
  const handleRemoveSearchItem = async (filterItem: ISearchItem) => {
    setQuery('');
    const updatedSearchItems = removeSearchItems(searchItems, filterItem);
    setSearchItems(updatedSearchItems);
    await UpdateReportFilter({
      filters: updatedSearchItems,
      gridKey,
    });
    if (onFetchRecords) {
      onFetchRecords?.({
        advance_filters: updatedSearchItems,
      });
      return;
    }
    router.refresh();
  };

  const handleClearSearchItems = async () => {
    setQuery('');

    const defaultFilters = gridState?.advanceFilter?.length
      ? gridState?.advanceFilter
      : gridState?.defaultAdvanceFilter || [];

    const updatedSearchItems = clearAllSearchItems(defaultFilters);
    setSearchItems(updatedSearchItems);

    await UpdateReportFilter({
      filters: updatedSearchItems,
      gridKey,
    });
    if (onFetchRecords) {
      onFetchRecords?.({
        advance_filters: updatedSearchItems,
      });
      return;
    }

    router.refresh();
  };

  // @use effects
  useEffect(() => {
    const currentAdvanceFilter = gridState?.advanceFilter || [];
    if (JSON.stringify(currentAdvanceFilter) === JSON.stringify(searchItems))
      return;

    setSearchItems(currentAdvanceFilter);
    setQuery('');

    const mappedAdvanceFilter = currentAdvanceFilter.map(
      ({ entity, operator, type, field, values, parse_as }) => ({
        entity: entity || defaultEntity,
        operator,
        type,
        field,
        values,
        ...(parse_as ? { parse_as } : {}),
      }),
    ) as ISearchItem[];

    if (onFetchRecords) {
      onFetchRecords({
        advance_filters: mappedAdvanceFilter,
      });
    }
  }, [gridState?.advanceFilter?.length, gridState?.advanceFilter]);

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
    handleOldSearchQuery,
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