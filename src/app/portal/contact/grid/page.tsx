import Grid from '~/components/platform/Grid/';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { api } from '~/trpc/server';
import AccountGridExpansion from '../_components/grids/AccountGridExpansion';
import { defaultAdvanceFilter } from './_config/advanceFilter';
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { customTabs } from './_config/customGridTabs';
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
    // 'contact_status',
    'status',
    'created_date',
    'updated_date',
    'created_time',
    'updated_time',
    'created_by',
    'updated_by',
  ];

  const gridCacheData =
    (await getGridCacheData({
      defaultGridTabs: customTabs,
      defaultSorting,
    })) ?? {};

  const { gridParams, gridProps } = gridDataResolver({
    entity: 'contact',
    pluck: _pluck,
    gridCacheData,
    defaults: {
      defaultSorting,
      defaultAdvanceFilter
    },
  });

  const { items = [], totalCount } = await api.contact.mainGrid({
    ...gridParams,
  });

  return (
    <Grid
      {...gridProps}
      totalCount={totalCount || 0}
      data={items}
      config={{
        isInfinite: true,
        entity: 'contact',
        title: 'Contacts',
        columnsOrder: gridCacheData?.columns,
        columns: gridColumns,
        defaultValues: {
          categories: ['Contact', 'Employee'],
          id: 'code',
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
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
        enableRowExpansion: true,
        rowExpansionBuilder: <AccountGridExpansion />,
        customTabDefaults: {
          defaultAdvanceFilter,
          defaultSorting,
        }
      }}
    />
  );
}
