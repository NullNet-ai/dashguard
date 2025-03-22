import Grid from '~/components/platform/Grid/Server';
import { getGridCacheData } from '~/lib/grid-get-cache-data';
import { api } from '~/trpc/server';
import ExpandedDefaultRow from '~/components/platform/Grid/common/ExpandedDefaultRow';
import { AccountCustomRowAction } from './_components/AccountCustomRowAction';
import gridColumns from './_config/columns';
import defaultSorting from './_config/sorting';

export default async function Page() {
  const { sorts, filters, pagination, columns : columnOrder,   groups } = (await getGridCacheData()) ?? {}

  const {
    items = [],
    totalCount,
    accountEmail,
  } = await api.account.fetchGridData({
    entity: 'organization_account',
    current: +(pagination?.current_page ?? '0'),
    limit: +(pagination?.limit_per_page ?? '100'),
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
    grouping: groups?.[0]?.field ? [groups[0].field] : [],
  });
  return (
    <Grid
      advanceFilter={filters?.advanceFilter || []}
      config={{
        entity: 'organization_account',
        title: 'Accounts',
        enableRowExpansion: true,
        rowExpansionOptions:{
          expandPosition: 'left',
          rowExpansionComponent: ExpandedDefaultRow,
          // icons: {
          //   expandIcon: <ArrowBigDown className='h-6 w-6 text-default/40'/>,
          //   collapseIcon: <ArrowBigDownDash className='h-6 w-6 text-default/40'/>,
          // }
        },
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
        customRowAction: AccountCustomRowAction,
      }}
      data={items}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      defaultSorting={
        sorts?.defaultSorting?.length ? sorts?.defaultSorting : defaultSorting
      }
      pagination={pagination}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      totalCount={totalCount || 0}
      grouping={groups || []}
    />
  );
}
