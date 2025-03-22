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
  const { sorts, pagination, filters, groups } =
    (await getGridCacheData()) ?? {};

  const headerList = headers();
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
    grouping: groups?.[0]?.field ? [groups[0].field] : [],
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      advanceFilter={filters?.advanceFilter || []}
      defaultSorting={
        sorts?.defaultSorting?.length ? sorts?.defaultSorting : defaultSorting
      }
      pagination={pagination}
      grouping={groups || []}
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
      }}
    />
  );
}
