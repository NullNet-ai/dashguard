import Grid from '~/components/platform/Grid';
import { api } from '~/trpc/server';
import ExpandedDefaultRow from '~/components/platform/Grid/common/ExpandedDefaultRow';
import { AccountCustomRowAction } from './_components/AccountCustomRowAction';
import gridColumns from './_config/columns';
import defaultSorting from './_config/sorting';
import { resolveGridParams } from '~/utils/grid-params-resolver';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';

export default async function Page() {
  const { sorts, filters, pagination, columns : columnOrder,   groups } = (await getGridCacheData()) ?? {}
  const { gridAdvanceFilter, gridDefaultAdvanceFilter, ...gridParams } =
  resolveGridParams({
    sorts,
    filters,
    groups,
    pagination,
    entity: 'account_organization',
  });
  const {
    items = [],
    totalCount,
    accountEmail,
  } = await api.account.fetchGridData({
    ...gridParams,
  });

  return (
    <Grid
      advanceFilter={filters?.advanceFilter || []}
      config={{
        entity: 'account_organization',
        paginationType:'centered',
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
        defaultShownColumns: [
          "first_name",
          "last_name",
        ],
        statusColumn: 'account_organization_status',
        columns: gridColumns,
        columnsOrder: columnOrder,
        // enableAutoCreate: false,
        searchConfig: {
          router: 'account',
          resolver: 'fetchGridData',
          query_params: {
            entity: 'account_organization',
            group_advance_filters: filters?.groupAdvanceFilters,
          },
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
                    accessor: 'account_organization_status',
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
