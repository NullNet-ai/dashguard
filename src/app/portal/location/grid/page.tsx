import Grid from '~/components/platform/Grid/';
import { api } from '~/trpc/server';
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';

// import EditComponent from "./customDefaultActions/Edit";
export default async function Page() {
  const _pluck = [
    'id',
    'code',
    'categories',
    'location_name',
    'status',
    'created_date',
    'updated_date',
    'created_time',
    'updated_time',
    'created_by',
    'updated_by',
  ];

  const gridCacheData = (await getGridCacheData({
    defaultSorting: defaultSorting,
  })) ?? {};
  
  const { gridParams, gridProps } = gridDataResolver({
    entity: 'location',
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
        isInfinite: true,
        entity: 'location',
        title: 'Locations',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        paginationType: 'default',
        enableAutoCreate: true,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchConfig: {
          router: 'grid',
          resolver: 'items',
          query_params: {
            entity: 'location',
            pluck: _pluck,
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
        customTabDefaults: {
          defaultSorting,
        },
        searchSuggestionConfig: {
          router:'search',
          resolver: 'searchSuggestions',
        },
      }}
    />
  );
}
