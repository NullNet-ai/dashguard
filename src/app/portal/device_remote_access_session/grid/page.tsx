import { headers } from 'next/headers';
import { Suspense } from 'react';

import Grid from '~/components/platform/Grid';
import StateTab from '~/components/platform/StateTab';
import { Loader } from '~/components/ui/loader';

import { api } from '~/trpc/server';

import { defaultSorting } from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { CustomNewButton } from './_components/CustomNewButton';
import uiGridColumns, { sshGridColumns, ttyGridColumns } from './_config/columns';
import { CustomRowActions } from './_components/CustomRowActions';

export default async function Page() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const buildGridData = async ({
    entity,
    pluck,
    gridKey,
    defaultAllTabName,
  }: {
    entity: string;
    pluck: string[];
    gridKey: string;
    defaultAllTabName: string;
  }) => {
    const gridCacheData =
      (await getGridCacheData({
        gridKey,
        entity: 'device_remote_access_session',
        pathname,
        defaultSorting: defaultSorting,
        gridEntity: entity,
        defaultAllTabName,
      })) ?? {};

    const { gridParams, gridProps } = gridDataResolver({
      entity,
      pluck,
      gridCacheData,
      defaults: {
        defaultSorting,
      },
    });

    const { items = [], totalCount } = await api.deviceRemoteAccessSession.mainGrid({
      ...gridParams,
    });

    return { gridProps, items, totalCount };
  };

  const [
    uiGrid,
    sshGrid,
    ttyGrid,
  ] = await Promise.all([
    buildGridData({
      gridKey: 'device_remote_access_ui',
      entity: 'device_tunnels',
      defaultAllTabName: 'All UI',
      pluck: [
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
      ],
    }),
    buildGridData({
      gridKey: 'device_remote_access_ssh',
      entity: 'device_ssh_sessions',
      defaultAllTabName: 'All SSH',
      pluck: [
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
      ],
    }),
    buildGridData({
      gridKey: 'device_remote_access_tty',
      entity: 'device_tty_sessions',
      defaultAllTabName: 'All TTY',
      pluck: [
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
      ],
    }),
  ]);

  const fallback = (
    <div className="flex h-[500px] w-full items-center justify-center">
      <div className="flex items-center justify-center">
        <Loader
          className="h-8 w-8 bg-primary text-primary"
          label=""
          variant="spinner"
        />
      </div>
    </div>
  );

  const gridBaseConfig = {
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

  const tabs = [
    {
      id: 'ui',
      label: 'UI',
      content: (
        <Suspense fallback={fallback}>
          <Grid
            {...uiGrid.gridProps}
            gridKey="device_remote_access_ui"
            config={{
              ...gridBaseConfig,
              columns: uiGridColumns,
              entity: 'device_tunnels',
              searchConfig: {
                router: 'deviceRemoteAccessSession',
                resolver: 'mainGrid',
                query_params: {
                  entity: 'device_tunnels',
                  pluck: [
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
                  ],
                },
              },
            }}
            customCreateButton={<CustomNewButton selectedTab="ui" />}
            data={uiGrid.items}
            defaultSorting={defaultSorting}
            totalCount={uiGrid.totalCount || 0}
          />
        </Suspense>
      ),
    },
    {
      id: 'ssh',
      label: 'SSH',
      content: (
        <Suspense fallback={fallback}>
          <Grid
            {...sshGrid.gridProps}
            gridKey="device_remote_access_ssh"
            config={{
              ...gridBaseConfig,
              columns: sshGridColumns,
              entity: 'device_ssh_sessions',
              searchConfig: {
                router: 'deviceRemoteAccessSession',
                resolver: 'mainGrid',
                query_params: {
                  entity: 'device_ssh_sessions',
                  pluck: [
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
                  ],
                },
              },
            }}
            customCreateButton={<CustomNewButton selectedTab="ssh" />}
            data={sshGrid.items}
            defaultSorting={defaultSorting}
            totalCount={sshGrid.totalCount || 0}
          />
        </Suspense>
      ),
    },
    {
      id: 'tty',
      label: 'TTY',
      content: (
        <Suspense fallback={fallback}>
          <Grid
            {...ttyGrid.gridProps}
            gridKey="device_remote_access_tty"
            config={{
              ...gridBaseConfig,
              columns: ttyGridColumns,
              entity: 'device_tty_sessions',
              searchConfig: {
                router: 'deviceRemoteAccessSession',
                resolver: 'mainGrid',
                query_params: {
                  entity: 'device_tty_sessions',
                  pluck: [
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
                  ],
                },
              },
            }}
            customCreateButton={<CustomNewButton selectedTab="tty" />}
            data={ttyGrid.items}
            defaultSorting={defaultSorting}
            totalCount={ttyGrid.totalCount || 0}
          />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <div>
        <StateTab
          defaultValue="ui"
          orientation="vertical"
          rotateText={true}
          persistKey="device-remote-access-session-grid-tabs"
          tabs={tabs}
          variant="underline"
          size="sm"
        />
      </div>
    </div>
  );
}
