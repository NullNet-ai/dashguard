import Grid from '~/components/platform/Grid/';
import { api } from '~/trpc/server';
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { resolveGridParams } from '~/components/platform/Grid/hooks/grid-params-resolver';

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

  const {
    sorts,
    pagination,
    filters,
    columns: columnOrder,
    groups,
  } = (await getGridCacheData()) ?? {};

  const { gridAdvanceFilter, gridDefaultAdvanceFilter, ...gridParams } =
    resolveGridParams({
      sorts,
      filters,
      groups,
      pagination,
      pluck: _pluck,
      entity: 'location',
    });

  const { items = [], totalCount } = await api.grid.items({
    ...gridParams,
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={
        sorts?.defaultSorting.length ? sorts?.defaultSorting : defaultSorting
      }
      defaultAdvanceFilter={gridDefaultAdvanceFilter}
      advanceFilter={gridAdvanceFilter}
      sorting={sorts?.sorting || []}
      pagination={pagination}
      grouping={groups || []}
      config={{
        isInfinite: true,
        entity: 'location',
        title: 'Locations',
        columnsOrder: columnOrder,
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
            group_advance_filters: filters?.groupAdvanceFilters,
          },
        },
      }}
    />
  );
}
