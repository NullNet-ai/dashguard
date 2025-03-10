import { api } from '~/trpc/server';
import Grid from '~/components/platform/Grid/Server';
import { headers } from 'next/headers';
import { getGridCacheData } from '~/lib/grid-get-cache-data';

/**
 *
 * @Default Grid Features
 *
 */
import gridColumns from './_config/columns';
import defaultSorting from './_config/sorting';

export default async function Page() {
  const { sorts, pagination, filters } = (await getGridCacheData()) ?? {};

  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity] = pathname.split('/');

  const _pluck = [
    'id',
    'code',
    'status',
    'name',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
  ];

  const { items = [], totalCount } = await api.grid.items({
    entity: main_entity!,
    pluck: _pluck,
    current: +(pagination?.current_page ?? '0'),
    limit: +(pagination?.limit_per_page ?? '100'),
    sorting: sorts.defaultSorting?.length
      ? sorts.defaultSorting
      : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      advanceFilter={filters?.advanceFilter || []}
      defaultSorting={sorts?.defaultSorting || defaultSorting}
      pagination={pagination}
      config={{
        entity: main_entity!,
        title: 'Communication Templates',
        columns: gridColumns,
        enableAutoCreate: false,
      }}
    />
  );
}
