import { api } from '~/trpc/server';
import Grid from '~/components/platform/Grid/Server';
// import { getGridCacheData } from '~/lib/grid-get-cache-data';

/**
 *
 * @Default Grid Features
 *
 */
import gridColumns from './_config/columns';
import defaultAdvanceFilter from './_config/advanceFilter';
import defaultSorting from './_config/sorting';
import { getGridCacheData } from '~/lib/grid-get-cache-data';

export default async function Page() {
  
  const { sorting, pagination, filters } = await getGridCacheData()


  const { items = [], totalCount } = await api.account.fetchGridData({
    entity: 'organization_account',
    current: +(pagination?.current_page ?? '0'),
    limit: +(pagination?.limit_per_page ?? '100'),
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  });
  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultAdvanceFilter}
      advanceFilter={filters?.reportFilters || []}
      sorting={sorting?.length ? sorting : []}
      pagination={pagination}
      config={{
        entity: 'organization_account',
        title: 'Accounts',
        columns: gridColumns,
        enableAutoCreate: false,
        searchConfig: {
          router: "account",
          resolver: "fetchGridData",
        },
      }}
    />
  );
}
