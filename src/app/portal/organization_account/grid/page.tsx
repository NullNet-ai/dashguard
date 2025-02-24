import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'
import { api } from '~/trpc/server'

/**
 *
 * @Default Grid Features
 *
 */
import defaultAdvanceFilter from './_config/advanceFilter'
import gridColumns from './_config/columns'
import defaultSorting from './_config/sorting'

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
  })
  return (
    <Grid
      advanceFilter={filters?.reportFilters || []}
      config={{
        entity: 'organization_account',
        title: 'Accounts',
        columns: gridColumns,
        enableAutoCreate: false,
        searchConfig: {
          router: 'account',
          resolver: 'fetchGridData',
        },
        rowActions: {
          archive: {
            state: {
              hidden: {
                match_condition: 'match_all',
                conditions: [
                  {
                    accessor: 'account_status',
                    value: ['Active'],
                  },
                ],
              },
            },
          },
        },
      }}
      data={items}
      defaultAdvanceFilter={defaultAdvanceFilter}
      defaultSorting={defaultSorting}
      pagination={pagination}
      sorting={sorting?.length ? sorting : []}
      totalCount={totalCount || 0}
    />
  )
}
