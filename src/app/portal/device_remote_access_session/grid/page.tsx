import { headers } from 'next/headers';
import { Suspense } from 'react';

import Grid from '~/components/platform/Grid';
import { Loader } from '~/components/ui/loader';

import { api } from '~/trpc/server';

import { defaultSorting } from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { CustomNewButton } from './_components/CustomNewButton';
import uiGridColumns from './_config/columns';
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

  const mainGrid = await buildGridData({
    gridKey: 'device_remote_access',
    entity: 'device_tunnels',
    defaultAllTabName: 'All Remote Access',
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
      'service_id',
      'tunnel_type',
      'tunnel_status',
      'last_access_date',
      'last_access_time',
    ],
  });

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
    enableRowClick: false,
    customRowAction: CustomRowActions,
    enableRowSelection: false,
    disableDefaultAction: true,
  };

  return (
    <div className="space-y-2">
      <Suspense fallback={fallback}>
        <Grid
          {...mainGrid.gridProps}
          gridKey="device_remote_access"
          config={{
            ...gridBaseConfig,
            columns: uiGridColumns,
            entity: 'device_tunnels',
            searchSuggestionConfig: {
              router: 'search',
              resolver: 'deviceRemoteAccessSessionSearch',
            },
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
                  'service_id',
                  'tunnel_type',
                  'tunnel_status',
                  'last_accessed',
                ],
              },
            },
          }}
          customCreateButton={<CustomNewButton />}
          data={mainGrid.items}
          defaultSorting={defaultSorting}
          totalCount={mainGrid.totalCount || 0}
        />
      </Suspense>
    </div>
  );
}
