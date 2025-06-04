import { api } from '~/trpc/server';
import Grid from '~/components/platform/Grid';
import { headers } from 'next/headers';

/**
 *
 * @Default Grid Features
 *
 */
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import defaultSorting from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import CustomCreateButton from '../_components/custom_create_button';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';

export default async function Page() {
  const gridCacheData = (await getGridCacheData({
    defaultSorting: defaultSorting,
  })) ?? {};
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity] = pathname.split('/');

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
    entity: main_entity!,
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
        entity: main_entity!,
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
            entity: main_entity!,
            pluck: _pluck,
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
      }}
      customCreateButton={<CustomCreateButton entity={main_entity!} />}
    />
  );
}
