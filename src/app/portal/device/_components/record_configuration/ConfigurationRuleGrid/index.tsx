'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '~/components/platform/Grid';
import {
  type IGridCacheDataResponse,
  getGridCacheData,
} from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import useFetchGridData from '~/hooks/useFetchGridData';
import gridColumns from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { api } from '~/trpc/react';
import { ulid } from 'ulid';
import { useSidebarTab } from '~/components/platform/SidebarTab/Provider';
import type { IConfigurationRuleGridProps, TGridDataResult } from './types';

const ConfigurationRuleGrid = ({
  code,
}: IConfigurationRuleGridProps) => {
  console.log("%c Line:21 🥪 code", "color:#e41a6a", code);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebarTab();

  const {
    data: record = { data: { id: null } },
    refetch,
    isSuccess: isRecordLoaded,
  } = api.record.getByCode.useQuery({
    id: code,
    pluck_fields: ['id'],
    main_entity: 'devices',
  });

  useEffect(() => {
    refetch()
  }, [refetch])

  const deviceId = record?.data?.id as string | null

  const { data: deviceInterfaces = [], isSuccess: isInterfacesLoaded } = api.deviceRule.getInterfaces.useQuery(
    { device_id: deviceId! },
    { enabled: !!deviceId },
  )

  // Wait until record is loaded and, if there's a deviceId, until its interfaces are loaded too.
  // This ensures the first (cache-writing) call to initializeGridTabs has the full defaultGridTabs.
  const isCacheReady = isRecordLoaded && (!deviceId || isInterfacesLoaded)

  const gridConfig = useMemo(() => {
    const floatingTab = {
      name: 'Floating',
      current: true,
      href: `${pathname}?filter_id=`,
      default: true,
      default_filter: [],
      group_advance_filters: [],
      advance_filters: [
        {
          type: 'criteria',
          field: 'floating',
          entity: 'device_filter_rules',
          operator: 'equal',
          values: ['true'],
          id: ulid(),
          label: 'Floating',
          default: true,
        },
      ],
      hidden: false,
      order: 0,
    }

    const interfaceTabs = deviceInterfaces.map((networkInterface, index) => ({
      name: networkInterface.toUpperCase(),
      current: false,
      href: `${pathname}?filter_id=`,
      default: true,
      default_filter: [],
      group_advance_filters: [],
      advance_filters: [
        {
          type: 'criteria',
          field: 'interface',
          entity: 'device_filter_rules',
          operator: 'equal',
          values: [networkInterface],
          id: ulid(),
          label: 'Interface',
          default: true,
        },
        {
          operator: 'and',
          type: 'operator',
          default: true,
        },
        {
          type: 'criteria',
          field: 'floating',
          entity: 'device_filter_rules',
          operator: 'equal',
          values: ['false'],
          id: ulid(),
          label: 'Floating',
          default: true,
        },
      ],
      hidden: false,
      order: index + 1,
    }))

    return {
      gridKey: 'configuration_rule_grid',
      entity: 'devices',
      application: 'record',
      identifier: code,
      pathname:
        `${pathname}` +
        `${searchParams?.toString() ? `?${searchParams?.toString()}` : ''}`,
      defaultSorting: defaultSorting,
      hideDefaultAllTab: true,
      defaultGridTabs: [floatingTab, ...interfaceTabs],
    }
  }, [pathname, searchParams, code, deviceInterfaces])
  console.log("🚀 ~ ConfigurationRuleGrid ~ gridConfig:", gridConfig)

  const [gridCachedData, setGridCachedData] = useState<IGridCacheDataResponse>(
    {} as IGridCacheDataResponse,
  );

  const getGridCachedData = useCallback(async () => {
    const cachedData = await getGridCacheData({
      ...gridConfig,
    });
    setGridCachedData(cachedData);
  }, [gridConfig]);

  const searchParamsString = searchParams?.toString();
  useEffect(() => {
    if (!code || !isCacheReady) return;
    getGridCachedData();
  }, [searchParamsString, code, getGridCachedData, isCacheReady]);

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
    'source_port_value',
    'source_ip_value',
    'source_type',
    'source_inversed',
    'destination_port_value',
    'destination_ip_value',
    'destination_type',
    'destination_inversed',
    'description',
    'created_by',
    'updated_by',
    'created_date',
    'updated_date',
    'disabled',
    'interface',
    'order',
    'ipprotocol'
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
  
  const { items = [], totalCount = 0 } = (grid_data ?? {}) as Partial<TGridDataResult>;

  useEffect(() => {
    if (record?.data?.id && !!grid_tabs?.[0]) {
      // @ts-expect-error - No type yet
      fetchData({ device_id: record?.data?.id, advance_filters: grid_tabs?.[0]?.advance_filters || [] })
    }
  }, [record?.data?.id, !!grid_tabs?.[0]])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex w-full flex-1 items-center justify-between bg-slate-100">
        <CardTitle className="text-md text-foreground">
          Rules
        </CardTitle>
      </CardHeader>
      <Grid
        {...gridProps}
        gridChildClass='!h-[calc(100vh-19.1em)]'
        sidebarTab={{
          closed: isCollapsed ?? false,
          useSidebar: true
        }}
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
          enableRowClick: false,
          // rowClickCustomAction: ({ row }) => {
          //   const { original } = row || {};
          //   const { code: page_code } = original?.page || {};
          //   router.push(`/portal/page/record/${page_code}/dashboard`);
          // },
          // customRowAction: CustomRowActions,
          onFetchRecords: fetchData,
          searchConfig: {
            router: 'deviceRule',
            resolver: 'mainGrid',
            query_params: {
              entity: 'device_filter_rules',
              pluck: _pluck,
              group_advance_filters: filters?.groupAdvanceFilters,
              sorting: gridCachedData?.sorts?.sorting,
              // @ts-expect-error - No type yet
              device_id: record?.data?.id,
            },
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

export default ConfigurationRuleGrid;
