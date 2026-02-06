'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Grid from '~/components/platform/Grid';
import {
  IGridCacheDataResponse,
  getGridCacheData,
} from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import useFetchGridData from '~/hooks/useFetchGridData';
import { defaultSorting } from './_config/sorting';
import gridColumns from './_config/columns';
import { api } from '~/trpc/react';

const ConfigurationAliasGrid = ({
  code,
}: {
  code: string;
}) => {
  const pathname = usePathname();
  const searchTest = useSearchParams();

  const grid_config = {
    gridKey: 'configuration_alias_grid',
    entity: 'devices',
    application: 'record',
    identifier: code,
    pathname:
      `${pathname}` +
      `${searchTest?.toString() ? `?${searchTest?.toString()}` : ''}`,
    defaultSorting: defaultSorting,
    defaultAllTabName: 'All Aliases',
  };

  const {
      data: record = { data: { id: null } },
      refetch,
      error,
    } = api.record.getByCode.useQuery({
      id: code,
      pluck_fields: ['id'],
      main_entity: 'devices',
    });

  const [gridCachedData, setGridCachedData] = useState<IGridCacheDataResponse>(
    {} as IGridCacheDataResponse,
  );

  const getGridCachedData = async () => {
    const gridCachedData = await getGridCacheData({
      ...grid_config,
    });
    setGridCachedData(gridCachedData);
  };

  useEffect(() => {
    if (!code) return;
    getGridCachedData();
  }, [searchTest?.toString(), code]);

  const { sorts, pagination, filters, groups, columns, grid_tabs } =
    (gridCachedData || {}) as IGridCacheDataResponse;

  const _pluck = [
    'id',
    'device_configuration_id',
    // 'device_rule_status',
    'status',
    // 'type',
    // 'policy',
    // 'protocol',
    // 'source_port',
    // 'source_addr',
    // 'source_type',
    // 'source_inversed',
    // 'destination_port',
    // 'destination_addr',
    // 'destination_type',
    // 'destination_inversed',
    // 'description',
    'created_by',
    'updated_by',
    'created_date',
    'updated_date',
    // 'disabled',
    // 'interface',
    // 'order',
    // New columns
    'type',
    'name',
    'description'
  ]

  const { gridParams, gridProps } = gridDataResolver({
    entity: 'aliases',
    pluck: _pluck,
    // @ts-expect-error - gridCacheData is not assignable to type IGridCacheDataResponse
    gridCacheData: {
      grid_tabs,
      sorts,
      filters,
      groups,
      columns,
      pagination,
    },
    defaults: {
      defaultSorting,
      defaultAdvanceFilter: [],
    },
  });

  const { fetchData, data: grid_data } = useFetchGridData(gridParams, {
    resolver: 'mainGrid',
    router: 'deviceAlias',
  });
  const { items = [], totalCount = 0 } = (grid_data || {}) as any;
    useEffect(() => {
      if (record?.data?.id) {
        // @ts-expect-error - No type yet
        fetchData({ device_id: record?.data?.id })
      }
    }, [record?.data?.id])

  return (
    <Card className="overflow-hidden max-w-[calc(100vw-38.4em)] h-[calc(100vh-7em)]">
      <CardHeader className="flex w-full flex-1 items-center justify-between bg-slate-100">
        <CardTitle className="text-md text-foreground">
          Aliases
        </CardTitle>
      </CardHeader>
      <Grid
        {...gridProps}
        gridParentClass="max-w-[calc(100vw-39em)] mx-auto"
        gridRecordClass="h-[calc(100vh-19.1em)]"
        gridKey="configuration_alias_grid"
        totalCount={totalCount || 0}
        parentType="record"
        data={items}
        config={{
          dimentionOptions: {
            gridStartPosition: 348,
            summaryWidth: 320,
          },
          entity: 'aliases',
          title: 'Aliases',
          columns: gridColumns,
          columnsOrder: columns,
          enableAutoCreate: false,
          disableDefaultAction: true,
          hideCreateButton: true,
          enableRowSelection: false,
          // rowClickCustomAction: ({ row }) => {
          //   const { original } = row || {};
          //   const { code: page_code } = original?.page || {};
          //   router.push(`/portal/page/record/${page_code}/dashboard`);
          // },
          // customRowAction: CustomRowActions,
          onFetchRecords: fetchData,
          searchConfig: {
            router: 'deviceAlias',
            resolver: 'mainGrid',
            query_params: {
              entity: 'aliases',
              pluck: _pluck,
              group_advance_filters: filters?.groupAdvanceFilters,
              sorting: gridCachedData?.sorts?.sorting,
            },
          },
          searchSuggestionConfig: {
            router: 'search',
            resolver: 'aliasSearch',
          },
          customTabDefaults: {
            defaultSorting,
            defaultAdvanceFilter: [],
          },
        }}
      />
    </Card>
  );
};

export default ConfigurationAliasGrid;