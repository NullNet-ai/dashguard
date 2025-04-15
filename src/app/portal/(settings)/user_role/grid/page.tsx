import { headers } from 'next/headers';

import Grid from '~/components/platform/Grid';

import { api } from '~/trpc/server';

import gridColumns from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { resolveGridParams } from '~/utils/grid-params-resolver';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';

export default async function UserRoleGridPage({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}) {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, ,] = pathname.split('/');
  const _pluck = [
    'id',
    'entity',
    'categories',
    'code',
    'role',
    'status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
  ];

  const {
    sorts,
    filters,
    pagination,
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
      entity: main_entity!,
    });

  const { items = [], totalCount } = await api.grid.items({
    ...gridParams,
  });

  return (
    <Grid
      config={{
        entity: main_entity!,
        title: 'User Roles',
        columns: gridColumns,
        columnsOrder: columnOrder,
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
      data={items}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      defaultSorting={
        sorts.defaultSorting?.length ? sorts.defaultSorting : defaultSorting
      }
      sorting={sorts.sorting?.length ? sorts.sorting : defaultSorting}
      advanceFilter={filters?.advanceFilter || []}
      pagination={pagination}
      totalCount={totalCount || 0}
      grouping={groups || []}
    />
  );
}
