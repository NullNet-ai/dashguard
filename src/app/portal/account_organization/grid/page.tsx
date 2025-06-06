import Grid from '~/components/platform/Grid';
import { api } from '~/trpc/server';
import ExpandedDefaultRow from '~/components/platform/Grid/common/ExpandedDefaultRow';
import { AccountCustomRowAction } from './_components/AccountCustomRowAction';
import gridColumns from './_config/columns';
import defaultSorting from './_config/sorting';
import { resolveGridParams } from '~/utils/grid-params-resolver';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';

export default async function Page() {
  const gridCacheData = (await getGridCacheData({
    defaultSorting: defaultSorting,
  })) ?? {}; 
  const { gridParams, gridProps } = gridDataResolver({
    entity: 'account_organization',
    gridCacheData,
    defaults: {
      defaultSorting,
    },
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
      {...gridProps}
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: 'account_organization',
        title: 'Accounts',
        enableRowExpansion: true,
        rowExpansionOptions:{
          expandPosition: 'left',
          rowExpansionComponent: ExpandedDefaultRow,
        },
        defaultShownColumns: [
          "first_name",
          "last_name",
        ],
        columns: gridColumns,
        columnsOrder: gridCacheData?.columns,
        searchConfig: {
          router: 'account',
          resolver: 'fetchGridData',
          query_params: {
            entity: 'account_organization',
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
        searchSuggestionConfig: {
          router:'search',
          resolver: 'accountSearch',
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
    />
  );
}
