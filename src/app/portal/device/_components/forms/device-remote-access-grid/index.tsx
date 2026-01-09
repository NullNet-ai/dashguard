'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import useFetchGridData from '~/hooks/useFetchGridData';

import { defaultSorting } from '~/app/portal/device_remote_access_session/grid/_config/sorting';
import gridColumns from '~/app/portal/device_remote_access_session/grid/_config/columns';
import { CustomNewButton } from '~/app/portal/device_remote_access_session/grid/_components/CustomNewButton';
import { CustomRowActions } from '~/app/portal/device_remote_access_session/grid/_components/CustomRowActions';

export default function DeviceRemoteAccessGrid(props) {
  const { deviceId, deviceCode } = props
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullPathname = useMemo(() => {
    const search = searchParams?.toString();
    return `${pathname ?? ''}${search ? `?${search}` : ''}`;
  }, [pathname, searchParams]);

  const [, , ] = (pathname ?? '').split('/');
  let main_entity = 'device_remote_access_session'

  const [gridCacheData, setGridCacheData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!main_entity) return;
    getGridCacheData({
      pathname: fullPathname,
      defaultSorting: defaultSorting,
      entity: main_entity,
      application: 'grid',
    }).then((data) => {
      setGridCacheData(data ?? {});
    });
  }, [fullPathname, main_entity]);

  const _pluck = [
    'id',
    'categories',
    'code',
    'status',
    'remote_access_type',
    'remote_access_category',
    'remote_access_session',
    'remote_access_status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
    'device_id',
  ];

  const { gridParams, gridProps } = useMemo(() => {
    return gridDataResolver({
      entity: main_entity || 'device_remote_access_session',
      pluck: _pluck,
      gridCacheData: gridCacheData as any,
      defaults: {
        defaultSorting,
      },
    });
  }, [gridCacheData, main_entity]);

  const gridParamsWithDeviceFilter = useMemo(() => {

    const currentAdvanceFilters = Array.isArray((gridParams as any)?.advance_filters)
      ? ((gridParams as any).advance_filters as any[])
      : [];

    const advanceFiltersWithoutDeviceId = currentAdvanceFilters.filter((f) => {
      return !(f?.type === 'criteria' && f?.field === 'device_id');
    });

    const shouldAddAndOperator =
      advanceFiltersWithoutDeviceId.length > 0
      && advanceFiltersWithoutDeviceId[advanceFiltersWithoutDeviceId.length - 1]?.type !== 'operator';

    const deviceFilter = {
      type: 'criteria',
      operator: 'equal',
      field: 'device_id',
      values: [deviceId],
    };

    return {
      ...gridParams,
      advance_filters: [
        ...advanceFiltersWithoutDeviceId,
        ...(shouldAddAndOperator ? [{ type: 'operator', operator: 'and' }] : []),
        deviceFilter,
      ],
      device_code: deviceCode,
    } as any;
  }, [gridParams, deviceId, deviceCode]);

  const { fetchData, data: grid_data, isLoading } = useFetchGridData(
    gridParamsWithDeviceFilter,
    {
      router: 'deviceRemoteAccessSession',
      resolver: 'mainGrid',
    },
  );

  const { items = [], totalCount = 0 } = (grid_data || {}) as any;

  useEffect(() => {
    fetchData(gridParamsWithDeviceFilter);
  }, [gridParamsWithDeviceFilter]);

  return (
    <Grid
      {...gridProps}
      config={{
        entity: main_entity!,
        title: 'Remote Access',
        columns: [
          {
            header: 'ID',
            accessorKey: 'code',
            search_config: {
              entity: 'device_remote_access_sessions',
              operator: 'like',
            },
          },
          {
            header: 'Type',
            accessorKey: 'device_remote_access_type',
            sortKey: 'device_remote_access_sessions.remote_access_type',
            search_config: {
              entity: 'device_remote_access_sessions',
              operator: 'like',
              field: 'remote_access_type',
            },
          },
        ],
        columnsOrder: gridCacheData?.columns,
        defaultValues: {
          entity_prefix: 'RA',
        },
        disableDefaultAction: true,
        enableRowClick: false,
        customRowAction: CustomRowActions,
        searchConfig: {
          router: 'deviceRemoteAccessSession',
          resolver: 'mainGrid',
          query_params: {
            entity: main_entity!,
            pluck: _pluck,
          },
        },
        searchSuggestionConfig: {
          router: 'search',
          resolver: 'deviceRemoteAccessSessionSearch',
        },
        onFetchRecords: fetchData,
      }}
      customCreateButton={<CustomNewButton deviceId={deviceId} deviceCode={deviceCode} />}
      data={items}
      defaultSorting={defaultSorting}
      isLoading={isLoading}
      totalCount={totalCount || 0}
    />
  );
}
