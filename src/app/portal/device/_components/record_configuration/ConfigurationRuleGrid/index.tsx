'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '~/components/platform/Grid';
import {
  type IGridCacheDataResponse,
  getGridCacheData,
} from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { CardHeader } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import useFetchGridData from '~/hooks/useFetchGridData';
import gridColumns from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { api } from '~/trpc/react';

const ConfigurationRuleGrid = ({
  code,
}: {
  code: string;
}) => {
  console.log("%c Line:21 🥪 code", "color:#e41a6a", code);
  const pathname = usePathname();
  const searchTest = useSearchParams();

  const grid_config = useMemo(() => ({
    gridKey: 'configuration_rule_grid',
    entity: 'devices',
    application: 'record',
    identifier: code,
    pathname:
      `${pathname}` +
      `${searchTest?.toString() ? `?${searchTest?.toString()}` : ''}`,
    defaultSorting: defaultSorting,
  }), [pathname, searchTest, code]);

  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    id: code,
    pluck_fields: ['id'],
    main_entity: 'devices',
  });

  useEffect(() => {
    refetch()
  }, [refetch])

  const [gridCachedData, setGridCachedData] = useState<IGridCacheDataResponse>(
    {} as IGridCacheDataResponse,
  );

  const getGridCachedData = useCallback(async () => {
    const gridCachedData = await getGridCacheData({
      ...grid_config,
    });
    setGridCachedData(gridCachedData);
  }, [grid_config]);

  const searchParamsString = searchTest?.toString();
  useEffect(() => {
    if (!code) return;
    getGridCachedData();
  }, [searchParamsString, code, getGridCachedData]);

  const { sorts, pagination, filters, groups, columns, grid_tabs } =
    (gridCachedData || {}) as IGridCacheDataResponse;

  const _pluck = [
    'id',
    'device_configuration_id',
    'device_rule_status',
    'status',
    'type',
    'policy',
    'protocol',
    'source_port',
    'source_addr',
    'source_type',
    'source_inversed',
    'destination_port',
    'destination_addr',
    'destination_type',
    'destination_inversed',
    'description',
    'created_by',
    'updated_by',
    'created_date',
    'updated_date',
    'disabled',
    'interface',
    'order'
  ]

  const { gridParams, gridProps } = gridDataResolver({
    entity: 'device_filter_rules',
    pluck: _pluck,
    // @ts-expect-error - No type yet
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
  


  const { fetchData, data: grid_data } = useFetchGridData({...gridParams,
    // @ts-expect-error - No type yet
    device_id: record?.data?.id}, {
    resolver: 'mainGrid',
    router: 'deviceRule',
  });
  
  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  useEffect(() => {
    if (record?.data?.id) {
      fetchData({ device_id: record?.data?.id })
    }
  }, [record?.data?.id])

  return (
    <>
      <CardHeader className="flex w-full flex-1 items-center justify-between bg-slate-100">
        <Label className="font-bold">Rules</Label>
      </CardHeader>
      <Grid
        {...gridProps}
        gridKey="configuration_rule_grid"
        totalCount={totalCount || 0}
        parentType="record"
        data={items}
        config={{
          dimentionOptions: {
            gridStartPosition: 348,
            summaryWidth: 320,
          },
          entity: 'device_filter_rules',
          title: 'Rules',
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
            // @ts-expect-error - No type yet
            router: 'deviceRule',
            resolver: 'mainGrid',
            query_params: {
              entity: 'device_rules',
              pluck: _pluck,
              group_advance_filters: filters?.groupAdvanceFilters,
              sorting: gridCachedData?.sorts?.sorting,
            },
          },
          customTabDefaults: {
            defaultSorting,
            defaultAdvanceFilter: [],
          },
        }}
      />
    </>
  );
};

export default ConfigurationRuleGrid;