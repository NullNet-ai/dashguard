'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Grid from '~/components/platform/Grid';
import StateTab from '~/components/platform/StateTab';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import useFetchGridData from '~/hooks/useFetchGridData';

import { defaultSorting } from '~/app/portal/device_remote_access_session/grid/_config/sorting';
import uiGridColumns, {
  sshGridColumns,
  ttyGridColumns,
} from '~/app/portal/device_remote_access_session/grid/_config/columns';
import { CustomNewButton } from '~/app/portal/device_remote_access_session/grid/_components/CustomNewButton';
import { CustomRowActions } from '~/app/portal/device_remote_access_session/grid/_components/CustomRowActions';

const UI_PLUCK = [
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
  'tunnel_type',
] as string[];

const SSH_PLUCK = [
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
  'device_tunnel_id',
  'session_status',
  'device_id',
] as string[];

const TTY_PLUCK = [
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
  'device_tunnel_id',
  'session_status',
  'device_id',
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
      customRowAction: CustomRowActions,
      searchSuggestionConfig: {
        router: 'search',
        resolver: 'deviceRemoteAccessSessionSearch',
      },
    } as const;
  }, []);

  const useDeviceScopedGridData = ({
    gridKey,
    entity,
    pluck,
    defaultAllTabName,
  }: {
    gridKey: string;
    entity: string;
    pluck: string[];
    defaultAllTabName: string;
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
      }).then((data) => {
        setGridCacheData(data ?? {});
      });
    }, [defaultAllTabName, entity, fullPathname, gridKey]);

    const { gridParams, gridProps } = useMemo(() => {
      return gridDataResolver({
        entity,
        pluck,
        gridCacheData: gridCacheData as any,
        defaults: {
          defaultSorting,
        },
      });
    }, [entity, gridCacheData, pluck]);

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

  const uiGridKey = useMemo(() => makeDeviceScopedGridKey('device_remote_access_ui'), [makeDeviceScopedGridKey]);
  const sshGridKey = useMemo(() => makeDeviceScopedGridKey('device_remote_access_ssh'), [makeDeviceScopedGridKey]);
  const ttyGridKey = useMemo(() => makeDeviceScopedGridKey('device_remote_access_tty'), [makeDeviceScopedGridKey]);

  const uiGrid = useDeviceScopedGridData({
    gridKey: uiGridKey,
    entity: 'device_tunnels',
    defaultAllTabName: 'All UI',
    pluck: UI_PLUCK,
  });

  const sshGrid = useDeviceScopedGridData({
    gridKey: sshGridKey,
    entity: 'device_ssh_sessions',
    defaultAllTabName: 'All SSH',
    pluck: SSH_PLUCK,
  });

  const ttyGrid = useDeviceScopedGridData({
    gridKey: ttyGridKey,
    entity: 'device_tty_sessions',
    defaultAllTabName: 'All TTY',
    pluck: TTY_PLUCK,
  });


  return (
    <div className="space-y-2">
      <div>
        <StateTab
          defaultValue="ui"
          orientation="vertical"
          rotateText={true}
          persistKey={`device-remote-access-session-device-grid-tabs${deviceId ? `-${deviceId}` : ''}`}
          tabs={[
            {
              id: 'ui',
              label: 'UI',
              content: (
                <Grid
                  {...uiGrid.gridProps}
                  gridKey={uiGridKey}
                  config={{
                    ...gridBaseConfig,
                    columns: uiGridColumns,
                    entity: 'device_tunnels',
                    columnsOrder: uiGrid.gridCacheData?.columns,
                    searchConfig: {
                      router: 'deviceRemoteAccessSession',
                      resolver: 'mainGrid',
                      query_params: {
                        entity: 'device_tunnels',
                        pluck: UI_PLUCK,
                      },
                    },
                    onFetchRecords: (params: any) => uiGrid.fetchData(uiGrid.applyDeviceFilter(params)),
                  }}
                  customCreateButton={
                    <CustomNewButton
                      deviceId={deviceId}
                      deviceCode={deviceCode}
                      selectedTab="ui"
                    />
                  }
                  data={uiGrid.items}
                  defaultSorting={defaultSorting}
                  isLoading={uiGrid.isLoading}
                  totalCount={uiGrid.totalCount || 0}
                />
              ),
            },
            {
              id: 'ssh',
              label: 'SSH',
              content: (
                <Grid
                  {...sshGrid.gridProps}
                  gridKey={sshGridKey}
                  config={{
                    ...gridBaseConfig,
                    columns: sshGridColumns,
                    entity: 'device_ssh_sessions',
                    columnsOrder: sshGrid.gridCacheData?.columns,
                    searchConfig: {
                      router: 'deviceRemoteAccessSession',
                      resolver: 'mainGrid',
                      query_params: {
                        entity: 'device_ssh_sessions',
                        pluck: SSH_PLUCK,
                      },
                    },
                    onFetchRecords: (params: any) => sshGrid.fetchData(sshGrid.applyDeviceFilter(params)),
                  }}
                  customCreateButton={
                    <CustomNewButton
                      deviceId={deviceId}
                      deviceCode={deviceCode}
                      selectedTab="ssh"
                    />
                  }
                  data={sshGrid.items}
                  defaultSorting={defaultSorting}
                  isLoading={sshGrid.isLoading}
                  totalCount={sshGrid.totalCount || 0}
                />
              ),
            },
            {
              id: 'tty',
              label: 'TTY',
              content: (
                <Grid
                  {...ttyGrid.gridProps}
                  gridKey={ttyGridKey}
                  config={{
                    ...gridBaseConfig,
                    columns: ttyGridColumns,
                    entity: 'device_tty_sessions',
                    columnsOrder: ttyGrid.gridCacheData?.columns,
                    searchConfig: {
                      router: 'deviceRemoteAccessSession',
                      resolver: 'mainGrid',
                      query_params: {
                        entity: 'device_tty_sessions',
                        pluck: TTY_PLUCK,
                      },
                    },
                    onFetchRecords: (params: any) => ttyGrid.fetchData(ttyGrid.applyDeviceFilter(params)),
                  }}
                  customCreateButton={
                    <CustomNewButton
                      deviceId={deviceId}
                      deviceCode={deviceCode}
                      selectedTab="tty"
                    />
                  }
                  data={ttyGrid.items}
                  defaultSorting={defaultSorting}
                  isLoading={ttyGrid.isLoading}
                  totalCount={ttyGrid.totalCount || 0}
                />
              ),
            },
          ]}
          variant="underline"
          size="sm"
        />
      </div>
    </div>
  );
}
