import { headers } from 'next/headers';

import Grid from '~/components/platform/Grid';

import { api } from '~/trpc/server';

import gridColumns from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';

export default async function DeviceGroupGridPage() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, ,] = pathname.split('/');
  const _pluck = [
    'id',
    'code',
    'name',
    'status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
  ];

  const gridCacheData =
    (await getGridCacheData({
      defaultSorting: defaultSorting,
    })) ?? {};
  const { gridParams, gridProps } = gridDataResolver({
    entity: 'device_group_settings',
    pluck: _pluck,
    gridCacheData,
    defaults: {
      defaultSorting,
    },
  });
  const { items = [], totalCount } = await api.deviceGroup.mainGrid({
    ...gridParams,
  });

  return (
    <Grid
      {...gridProps}
      data={items}
      totalCount={totalCount || 0}
      config={{
        entity: 'device_group',
        title: 'Device Groups',
        columns: gridColumns,
        columnsOrder: gridCacheData?.columns,
        enableAutoCreate: false,
        searchConfig: {
          router: 'deviceGroup',
          resolver: 'mainGrid',
          query_params: {
            entity: 'device_group_settings',
            pluck: _pluck,
          },
        },
        customTabDefaults: {
          defaultSorting,
        },
      }}
    />
  );
}
