import { headers } from 'next/headers';
import Grid from '~/components/platform/Grid';
import { api } from '~/trpc/server';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import CustomCreateButton from '../_components/custom_create_button';
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import defaultSorting from './_config/sorting';

export default async function Page() {
  const gridCacheData = (await getGridCacheData({
    defaultSorting: defaultSorting,
  })) ?? {};

  const _pluck = [
    'id',
    'code',
    'categories',
    'status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'instance_name',
    'model',
    'updated_by',
  ];

  const { gridParams, gridProps } = gridDataResolver({
    entity: 'device',
    pluck: _pluck,
    gridCacheData,
    defaults: {
      defaultSorting,
    },
  });
  
  const { items = [], totalCount } = await api.device.mainGrid({
    ...gridParams,
    is_case_sensitive_sorting: "false",
  })

  return (
    <Grid
      {...gridProps}
      totalCount={totalCount || 0}
      data={items}
      config={{
        isInfinite: true,
        entity: 'device',
        title: 'Devices',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        defaultValues: {
          id: 'code',
        },
        // paginationType: 'default',
        enableAutoCreate: true,
        defaultShownColumns: ['created_date', 'updated_date'],
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchConfig: {
          router: 'device',
          resolver: 'mainGrid',
          query_params: {
            entity: 'device',
            pluck: _pluck,
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
        customTabDefaults: {
          defaultSorting,
        },
        searchSuggestionConfig: {
          router:'search',
          resolver: 'deviceSearch',
        },
      }}
      customCreateButton={<CustomCreateButton entity={'device'} />}
    />
  );
}
