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
import { Label } from '~/components/ui/label';
import useFetchGridData from '~/hooks/useFetchGridData';
import gridColumns from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { api } from '~/trpc/react';
import { ulid } from 'ulid';
import { useSidebarTab } from '~/components/platform/SidebarTab/Provider';

const ConfigurationRuleGrid = ({
  code,
}: {
  code: string;
}) => {
  console.log("%c Line:21 🥪 code", "color:#e41a6a", code);
  const pathname = usePathname();
  const searchTest = useSearchParams();
  const { isCollapsed } = useSidebarTab();

  const grid_config = useMemo(() => ({
    gridKey: 'configuration_rule_grid',
    entity: 'devices',
    application: 'record',
    identifier: code,
    pathname:
      `${pathname}` +
      `${searchTest?.toString() ? `?${searchTest?.toString()}` : ''}`,
    defaultSorting: defaultSorting,
    hideDefaultAllTab: true,
    defaultGridTabs: [
      {
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
      },
      {
        name: 'WAN',
        current: true,
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
            values: ['wan'],
            id: ulid(),
            label: 'Interface',
            default: true,
          },
          {
            operator: "and",
            type: "operator",
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
        order: 0,
      },
      {
        name: 'LAN',
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
            values: ['lan'],
            id: ulid(),
            label: 'Interface',
            default: true,
          },
          {
            operator: "and",
            type: "operator",
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
        order: 1,
      },
      {
        name: 'Others',
        current: false,
        href: `${pathname}?filter_id=`,
        default: true,
        default_filter: [],
        group_advance_filters: [],
        advance_filters: [
          {
            type: 'criteria',
            field: 'floating',
            entity: 'device_filter_rules',
            operator: 'not_equal',
            values: ['true'],
            id: ulid(),
            label: 'Floating',
            default: true,
          },
          {
            operator: "and",
            type: "operator",
            default: true,
          },
          {
            type: 'criteria',
            field: 'interface',
            entity: 'device_filter_rules',
            operator: 'not_equal',
            values: ['wan'],
            id: ulid(),
            label: 'Interface',
            default: true,
          },
          {
            operator: "and",
            type: "operator",
            default: true,
          },
          {
            type: 'criteria',
            field: 'interface',
            entity: 'device_filter_rules',
            operator: 'not_equal',
            values: ['lan'],
            id: ulid(),
            label: 'Interface',
            default: true,
          },
          {
            operator: "and",
            type: "operator",
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
        order: 1,
      },
    ],
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
  
  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  useEffect(() => {
    if (record?.data?.id && !!grid_tabs?.[0]) {
      // @ts-expect-error - No type yet
      fetchData({ device_id: record?.data?.id, advance_filters: grid_tabs?.[0]?.advance_filters || [] })
    }
  }, [record?.data?.id, !!grid_tabs?.[0]])

  return (
    <Card className="overflow-hidden h-[calc(100vh-7.5em)]">
      <CardHeader className="flex w-full flex-1 items-center justify-between bg-slate-100">
        <CardTitle className="text-md text-foreground">
          Rules
        </CardTitle>
      </CardHeader>
      <Grid
        {...gridProps}
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
