import { api } from '~/trpc/server';
import Grid from '~/components/platform/Grid';
import { headers } from 'next/headers';

/**
 *
 * @Default Grid Features
 *
 */
import gridColumns from './_config/columns';
import defaultSorting from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';

export default async function Page() {
  const gridCacheData = (await getGridCacheData({
    defaultSorting: defaultSorting,
  })) ?? {};
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity] = pathname.split('/');

  const _pluck = [
    'id',
    'code',
    'status',
    'name',
    'event',
    'categories',
    'communication_template_status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
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
  
  const { items = [], totalCount } = await api.grid.items({
    ...gridParams,
  });

  return (
    <Grid
      {...gridProps}
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: main_entity!,
        title: 'Communication Templates',
        columns: gridColumns,
        enableAutoCreate: false,
        searchConfig: {
          router: 'grid',
          resolver: 'items',
          query_params: {
            entity: main_entity!,
            pluck: _pluck,
          },
        },
        searchSuggestionConfig: {
          router:'search',
          resolver:'searchSuggestions',
        },
        customTabDefaults: {
          defaultSorting,
        }
      }}
    />
  );
}
