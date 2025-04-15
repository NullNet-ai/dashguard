'use client';

import { type IGridGroupingExpansionProps } from '~/components/platform/Grid/types';
import { CardFooter } from '~/components/ui/card';
import { Loader } from '~/components/ui/loader';
import useFetchGridData from '~/hooks/useFetchGridData';
import Pagination from '../../Pagination';
import GridProvider from '../../Provider';
import MyTableBody from '../../TableBody';
import ErrorPage from '../../common/ErrorPage';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';
import { resolveAdvanceFilter } from '../../Search/utils/advanceFilterResolver';

const GridGroupingExpansion = (props: IGridGroupingExpansionProps) => {
  const {
    rowData,
    config,
    initialColumns,
    grouping,
    visibleColumns,
    parentGroupData,
    gridState,
    parentGroupFields,
  } = props ?? {};

  const { open } = useSidebar();

  const pagination = {
    current_page: 1,
    limit_per_page: 10,
  };
  const defaultSorting = [
    {
      id: 'created_date',
      desc: true,
    },
  ];
  const gridQueryConfigs = {
    defaultSorting: gridState?.sorting,
    defaultAdvanceFilter: gridState?.defaultAdvanceFilter,
    advanceFilter: gridState?.advanceFilter,
    sorting: gridState?.sorting,
    pagination: pagination,
  };
  const constructGridFilter = (data: Record<string, any>[]) => {
    const gridFilter = data?.reduce((acc, item, index) => {
      const { field, value, entity } = item ?? {};
      const filterItem = {
        type: 'criteria',
        field,
        operator:
          value === null || value === undefined
            ? 'is_null'
            : Array.isArray(value)
              ? 'like'
              : 'equal',
        entity: entity || config.entity,
        values: Array.isArray(value) ? [JSON.stringify(value)] : [value],
      };
      if (index > 0) {
        return [...acc, { type: 'operator', operator: 'and' }, filterItem];
      }
      return [...acc, filterItem];
    }, [] as any);

    return gridFilter;
  };
  const groupAdvanceFilters =
    gridState?.config?.searchConfig?.query_params?.group_advance_filters;
  const gridFilters = resolveAdvanceFilter({
    currentAdvanceFilter: groupAdvanceFilters?.length
      ? groupAdvanceFilters
      : (gridState?.advanceFilter ?? []),
    additionalFilter: constructGridFilter([
      ...(parentGroupData ?? []),
      rowData,
    ]),
  });
  const groupFields = grouping?.map((item) => {
    const columnConfig = initialColumns?.find(
      (column: any) => column?.accessorKey === item,
    ) as any;
    const label = (columnConfig?.header as string) ?? '';
    const entity = columnConfig?.search_config?.entity || config.entity;
    const field = columnConfig?.search_config?.field || item;
    const groupSort = parentGroupFields?.find((item) => item?.field === field);
    return {
      value: item,
      field: `${entity}.${field}`,
      label,
      desc: typeof groupSort?.desc === 'boolean' ? groupSort?.desc : false,
    };
  });
  const groupSort = parentGroupFields?.find(
    (item) => item?.field === groupFields?.[0]?.field,
  );
  const newSorting = groupSort
    ? [
        {
          id: groupSort?.value,
          desc: groupSort?.desc,
          sort_key: groupSort?.field,
        },
      ]
    : [];

  const { fetchData, data, error, isLoading } = useFetchGridData(
    {
      current: pagination?.current_page,
      limit: groupFields?.[0]?.field ? 500 : pagination?.limit_per_page,
      entity: config.entity,
      pluck: config.searchConfig?.query_params?.pluck,
      sorting: newSorting?.length
        ? newSorting
        : gridQueryConfigs?.sorting?.length
          ? gridQueryConfigs?.sorting
          : defaultSorting,
      grouping: groupFields?.[0]?.field ? [groupFields[0].field as string] : [],
      ...gridFilters,
    },
    {
      resolver: config.searchConfig?.resolver ?? 'items',
      router: config.searchConfig?.router ?? 'grid',
    },
  );

  const { items = [], totalCount = 0 } = data ?? {};

  if (isLoading && !items?.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader
          className="bg-primary text-primary"
          label="Fetching data..."
          size="md"
          variant="circularShadow"
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorPage refetch={() => config?.onFetchRecords?.({})} />
      </div>
    );
  }

  const _width = open
    ? {
        width: 'calc(100vw - 330px)',
      }
    : {
        width: '100%',
      };

  return (
    <GridProvider
      {...gridQueryConfigs}
      config={{
        ...config,
        columns: visibleColumns,
        group_by_initial_columns: initialColumns,
        parentGroupData: [...(parentGroupData ?? []), { ...rowData }],
        onFetchRecords: fetchData,
        parentGroupFields: groupFields,
      }}
      parentType="grid_expansion"
      data={items}
      totalCount={totalCount}
      grouping={grouping}
    >
      <div className={cn(`hidden lg:grid`)}>
        <MyTableBody />
        {!grouping?.length && (
          <CardFooter style={_width}>
            <Pagination />
          </CardFooter>
        )}
      </div>
    </GridProvider>
  );
};

export default GridGroupingExpansion;
