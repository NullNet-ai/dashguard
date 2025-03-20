'use client';
import Grid from '~/components/platform/Grid/Client';
import StatusCell from '~/components/ui/status-cell';

import {
  IConfigGrid,
  type IGridGroupingExpansionProps,
} from '~/components/platform/Grid/types';
import useFetchGridData from '~/hooks/useFetchGridData';
import GridProvider from '../Provider';
import MyTableBody from '../TableBody';
import gridColumns from '~/app/portal/contact/grid/_config/columns';
import { defaultAdvanceFilter } from '~/app/portal/contact/grid/_config/advanceFilter';
import { Table } from 'lucide-react';
import {
  IGridCacheDataResponse,
  getGridCacheData,
} from '~/lib/grid-get-cache-data';
import { api } from '~/trpc/react';
import { IGroupBy } from '../Category/type';
import { Loader } from '~/components/ui/loader';
import ErrorPage from './ErrorPage';

const GridGroupingExpansion = (props: IGridGroupingExpansionProps) => {
  const {
    rowData,
    config,
    initialColumns,
    grouping,
    visibleColumns,
    parentGroupData,
    gridState,
  } = props ?? {};

  const { data: gridData } = api.grid.getReportCachedData.useQuery();
  const cachedData =
    typeof gridData === 'object'
      ? gridData
      : {
          sorts: {
            sorting: [],
            defaultSorting: [],
          },
          pagination: {
            current_page: 1,
            limit_per_page: 100,
          },
          filters: {
            advanceFilter: [],
            reportFilters: [],
            defaultFilters: [],
            groupAdvanceFilters: [],
          },
          columns: [],
          groups: [],
        };
  const { pagination, filters } =
    (cachedData as unknown as IGridCacheDataResponse) ?? {};
  const gridQueryConfigs = {
    defaultSorting: gridState?.sorting,
    defaultAdvanceFilter: gridState?.defaultAdvanceFilter,
    advanceFilter: gridState?.advanceFilter,
    sorting: gridState?.sorting,
    pagination: gridState?.pagination,
  };

  const defaultSorting = [
    {
      id: 'created_date',
      desc: true,
    },
  ];
  const constructGridFilter = (data: Record<string, any>[]) => {
    const gridFilter = data?.reduce((acc, item, index) => {
      const { field, value } = item ?? {};
      const filterItem = {
        type: 'criteria',
        field,
        operator: Array.isArray(value) ? 'like' : 'equal',
        entity: config.entity,
        values: Array.isArray(value) ? [JSON.stringify(value)] : [value],
      };
      if (index > 0) {
        return [...acc, { type: 'operator', operator: 'and' }, filterItem];
      }
      return [...acc, filterItem];
    }, [] as any);

    return gridFilter;
  };
  const gridFilter = [
    ...(filters?.groupAdvanceFilters?.length
      ? [
          {
            type: 'operator',
            operator: 'and',
          },
        ]
      : []),
    ...constructGridFilter([...(parentGroupData ?? []), rowData]),
  ];
  const groupFields = grouping?.map((item) => {
    const label = initialColumns?.find(
      (column: any) => column?.accessorKey === item,
    )?.header as string;
    return {
      value: item,
      label,
    };
  });

  const defaultPagination = pagination?.limit_per_page
    ? pagination
    : {
        current_page: +(pagination?.current_page ?? '1'),
        limit_per_page: +(pagination?.limit_per_page ?? '100'),
      };

  const { data, error, isLoading } = useFetchGridData(
    {
      current: +(defaultPagination?.current_page ?? '1'),
      limit: +(defaultPagination?.limit_per_page ?? '100'),
      entity: config.entity,
      pluck: config.searchConfig?.query_params?.pluck,
      sorting: gridQueryConfigs?.sorting?.length ? gridQueryConfigs?.sorting : defaultSorting,
      advance_filters: [...(filters?.advanceFilter ?? []), ...gridFilter],
      grouping: groupFields?.length ? [groupFields[0] as IGroupBy] : [],
    },
    {
      resolver: config.searchConfig?.resolver ?? 'items',
      router: config.searchConfig?.router ?? 'grid',
    },
  );

  console.log('search parsmsss', {
    current: +(defaultPagination?.current_page ?? '1'),
    limit: +(defaultPagination?.limit_per_page ?? '100'),
    entity: config.entity,
    pluck: config.searchConfig?.query_params?.pluck,
    sorting: gridQueryConfigs?.sorting?.length ? gridQueryConfigs?.sorting : defaultSorting,
    advance_filters: [...(filters?.advanceFilter ?? []), ...gridFilter],
    grouping: groupFields?.length ? [groupFields[0] as IGroupBy] : [],
  })

  const { items = [], totalCount = 0 } = data ?? {};

  if (isLoading && !items?.length) {
    return (
      <div
        className="flex h-full items-center justify-center"
        // style={{ width: isMobile ? '100%' : gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
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
      <div
        className="flex h-full items-center justify-center"
        // style={{ width: gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
        <ErrorPage refetch={() => config?.onFetchRecords?.({})} />
      </div>
    );
  }

  return (
    <GridProvider
      {...gridQueryConfigs}
      config={{
        ...config,
        columns: visibleColumns,
        group_by_initial_columns: initialColumns,
        parentGroupData: [...(parentGroupData ?? []), { ...rowData }],
      }}
      data={items}
      totalCount={totalCount}
      grouping={grouping}
    >
      <div className="hidden lg:grid">
        <MyTableBody showPagination={!grouping?.length} />
      </div>
    </GridProvider>
  );
};

export default GridGroupingExpansion;
