import Grid from '~/components/platform/Grid/Server';
import { getGridCacheData } from '~/lib/grid-get-cache-data';
import { api } from '~/trpc/server';
import { resolveGridParams } from '~/utils/grid-params-resolver';
import AccountGridExpansion from '../_components/grids/AccountGridExpansion';
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { defaultSorting } from './_config/sorting';

// import EditComponent from "./customDefaultActions/Edit";
export default async function Page() {
  const _pluck = [
    'id',
    'code',
    'categories',
    'organization_id',
    'first_name',
    'middle_name',
    'last_name',
    'email_address',
    'contact_status',
    'status',
    'created_date',
    'updated_date',
    'created_time',
    'updated_time',
    'created_by',
    'updated_by',
  ];

  const {
    sorts,
    pagination,
    filters,
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
      entity: 'contact',
    });

  const { items = [], totalCount } = await api.contact.mainGrid({
    ...gridParams,
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={
        sorts?.defaultSorting.length ? sorts?.defaultSorting : defaultSorting
      }
      defaultAdvanceFilter={gridDefaultAdvanceFilter}
      advanceFilter={gridAdvanceFilter}
      sorting={sorts?.sorting || []}
      pagination={pagination}
      grouping={groups || []}
      config={{
        isInfinite: true,
        entity: 'contact',
        title: 'Contacts',
        columnsOrder: columnOrder,
        columns: gridColumns,
        defaultValues: {
          categories: ['Contact', 'Employee'],
          id: 'code'
        },
        paginationType: 'default',
        defaultShownColumns: ['raw_phone_number', 'email'],
        enableAutoCreate: false,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchConfig: {
          router: 'contact',
          resolver: 'mainGrid',
          query_params: {
            entity: 'contact',
            pluck: _pluck,
            group_advance_filters: filters?.groupAdvanceFilters,
          },
        },
        enableRowExpansion: true,
        rowExpansionBuilder: <AccountGridExpansion />,
      }}
    />
  );
}
