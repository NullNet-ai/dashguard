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
import { AccountCustomRowAction } from './_components/AccountCustomRowAction'

export default async function Page() {
  const { sorts, filters, pagination, columns : columnOrder } = (await getGridCacheData()) ?? {}

  const { items = [], totalCount, accountEmail } = await api.account.fetchGridData({
    entity: 'organization_account',
    current: +(pagination?.current_page ?? '0'),
    limit: +(pagination?.limit_per_page ?? '100'),
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  })
  return (
    <Grid
      advanceFilter={filters?.advanceFilter || []}
      config={{
        entity: 'organization_account',
        title: 'Accounts',
        columns: gridColumns,
        columnsOrder: columnOrder,
        enableAutoCreate: false,
        searchConfig: {
          router: 'account',
          resolver: 'fetchGridData',
        },
        additionalData: {
          accountEmail,
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
        customRowAction: AccountCustomRowAction
      }}
      data={items}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      defaultSorting={sorts?.defaultSorting || defaultSorting}
      pagination={pagination}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      totalCount={totalCount || 0}
    />
  )
}
