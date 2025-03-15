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

  const _pluck = ['id', 'code', 'status', 'created_date', 'updated_date'];

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
      data={items}
      totalCount={totalCount || 0}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      defaultSorting={sorts?.defaultSorting || defaultSorting}
      pagination={pagination}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      advanceFilter={filters?.advanceFilter || []}
      config={{
        entity: main_entity!,
        title: 'New Grid',
        columns: gridColumns,
      }}
    />
  );
}
