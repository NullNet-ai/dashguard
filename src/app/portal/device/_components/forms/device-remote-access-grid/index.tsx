'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import useFetchGridData from '~/hooks/useFetchGridData';

import { defaultSorting } from '~/app/portal/device_remote_access_session/grid/_config/sorting';
import uiGridColumns from '~/app/portal/device_remote_access_session/grid/_config/columns';
import { CustomNewButton } from '~/app/portal/device_remote_access_session/grid/_components/CustomNewButton';
import { CustomRowActions } from '~/app/portal/device_remote_access_session/grid/_components/CustomRowActions';
import { ulid } from 'ulid';

const PLUCK = [
  'id',
  'categories',
  'code',
  'status',
  'created_date',
  'created_time',
  'created_by',
  'updated_date',
  'updated_time',
  'updated_by',
  'device_id',
  'service_id',
  'tunnel_type',
  'tunnel_status',
  'last_accessed',
] as string[];

// @ts-expect-error  - No type yet
export default function DeviceRemoteAccessGrid(props) {
  const { deviceId, deviceCode } = props;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullPathname = useMemo(() => {
    const search = searchParams?.toString();
    return `${pathname ?? ''}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);

  const [, ,] = (pathname ?? '').split('/');
  const main_entity = 'device_remote_access_session';

  const makeDeviceScopedGridKey = useCallback(
    (baseKey: string) => {
      if (!deviceId) return baseKey;
      return `${baseKey}_${deviceId}`;
    },
    [deviceId],
  );

  const gridBaseConfig = useMemo(() => {
    return {
      title: 'Remote Access',
      defaultValues: {
        entity_prefix: 'RA',
      },
      disableDefaultAction: true,
      enableRowClick: false,
      enableCreateCustomGridFilter: false,
      enableManageCustomGridFilter: false,
      customRowAction: CustomRowActions,
      searchSuggestionConfig: {
        router: 'search',
        resolver: 'deviceRemoteAccessSessionSearch',
      },
    } as const;
  }, []);

  const defaultAdvanceFilter = useMemo(() => {
    return [
      {
        entity: 'device_tunnels',
        operator: 'equal',
        type: 'criteria',
        field: 'tunnel_status',
        id: ulid(),
        label: 'Tunnel Status',
        values: ['idle'],
        default: true,
      },
      {
        entity: 'device_tunnels',
        operator: 'or',
        type: 'operator',
        default: true,
      },
      {
        entity: 'device_tunnels',
        operator: 'equal',
        type: 'criteria',
        field: 'tunnel_status',
        id: ulid(),
        label: 'Tunnel Status',
        values: ['active'],
        default: true,
      },
    ];
  }, []);

  const useDeviceScopedGridData = ({
    gridKey,
    entity,
    pluck,
    defaultAllTabName,
    defaultAdvanceFilter,
  }: {
    gridKey: string;
    entity: string;
    pluck: string[];
    defaultAllTabName: string;
    defaultAdvanceFilter: any[];
  }) => {
    const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});

    useEffect(() => {
      getGridCacheData({
        gridKey,
        entity: main_entity,
        pathname: fullPathname,
        defaultSorting,
        gridEntity: entity,
        defaultAllTabName,
        defaultAdvanceFilter,
      }).then((data) => {
        setGridCacheData(data ?? {});
      });
    }, [defaultAdvanceFilter, defaultAllTabName, entity, fullPathname, gridKey]);

    const { gridParams, gridProps } = useMemo(() => {
      return gridDataResolver({
        entity,
        pluck,
        gridCacheData: gridCacheData as any,
        defaults: {
          defaultSorting,
          defaultAdvanceFilter,
        },
      });
    }, [defaultAdvanceFilter, entity, gridCacheData, pluck]);

    const applyDeviceFilter = useCallback(
      (params: any) => {
        const currentAdvanceFilters = Array.isArray(params?.advance_filters)
          ? (params.advance_filters as any[])
          : [];

        const advanceFiltersWithoutDeviceId = currentAdvanceFilters.filter((f) => {
          return !(f?.type === 'criteria' && f?.field === 'device_id');
        });

        if (!deviceId) {
          return {
            ...params,
            advance_filters: advanceFiltersWithoutDeviceId,
            device_code: deviceCode,
          } as any;
        }

        const shouldAddAndOperator =
          advanceFiltersWithoutDeviceId.length > 0
          && advanceFiltersWithoutDeviceId[advanceFiltersWithoutDeviceId.length - 1]?.type !== 'operator';

        const deviceFilter = {
          type: 'criteria',
          operator: 'equal',
          field: 'device_id',
          entity,
          values: [deviceId],
        };

        return {
          ...params,
          advance_filters: [
            ...advanceFiltersWithoutDeviceId,
            ...(shouldAddAndOperator ? [{ type: 'operator', operator: 'and' }] : []),
            deviceFilter,
          ],
          device_code: deviceCode,
        } as any;
      },
      [deviceCode, deviceId],
    );

    const gridParamsWithDeviceFilter = useMemo(() => {
      return applyDeviceFilter(gridParams);
    }, [applyDeviceFilter, gridParams]);

    const { fetchData, data: grid_data, isLoading } = useFetchGridData(
      gridParamsWithDeviceFilter,
      {
        router: 'deviceRemoteAccessSession',
        resolver: 'mainGrid',
      },
    );

    const lastFetchedArgsRef = useRef<string>('');
    useEffect(() => {
      const nextArgsKey = JSON.stringify(gridParamsWithDeviceFilter ?? {});
      if (lastFetchedArgsRef.current === nextArgsKey) return;
      lastFetchedArgsRef.current = nextArgsKey;
      fetchData(gridParamsWithDeviceFilter);
    }, [gridParamsWithDeviceFilter]);

    const { items = [], totalCount = 0 } = (grid_data || {}) as any;

    return {
      gridProps,
      gridCacheData,
      gridParamsWithDeviceFilter,
      applyDeviceFilter,
      fetchData,
      isLoading,
      items,
      totalCount,
    };
  };

  const gridKey = useMemo(
    () => makeDeviceScopedGridKey('device_remote_access'),
    [makeDeviceScopedGridKey],
  );

  const grid = useDeviceScopedGridData({
    gridKey,
    entity: 'device_tunnels',
    defaultAllTabName: 'All Remote Access',
    pluck: PLUCK,
    defaultAdvanceFilter,
  });

  return (
    <div className="space-y-2">
      <Grid
        {...grid.gridProps}
        gridKey={gridKey}
        hideCreateNewFilter
        config={{
          ...gridBaseConfig,
          columns: uiGridColumns,
          entity: 'device_tunnels',
          enableRowSelection: false,
          columnsOrder: grid.gridCacheData?.columns,
          searchConfig: {
            router: 'deviceRemoteAccessSession',
            resolver: 'mainGrid',
            query_params: {
              entity: 'device_tunnels',
              pluck: PLUCK,
            },
          },
          onFetchRecords: (params: any) => grid.fetchData(grid.applyDeviceFilter(params)),
        }}
        customCreateButton={<CustomNewButton deviceId={deviceId} deviceCode={deviceCode} />}
        data={grid.items}
        defaultSorting={defaultSorting}
        defaultAdvanceFilter={defaultAdvanceFilter}
        isLoading={grid.isLoading}
        totalCount={grid.totalCount || 0}
      />
    </div>
  );
}
