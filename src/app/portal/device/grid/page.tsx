import { api } from "~/trpc/server";
import Grid from "~/components/platform/Grid";
import { headers } from "next/headers";

/**
 *
 * @Default Grid Features
 *
 */
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import defaultSorting from "./_config/sorting";
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { resolveGridParams } from '~/utils/grid-params-resolver';
import CustomCreateButton from '../_components/custom_create_button';

export default async function Page() {
  const {
    sorts,
    pagination,
    filters,
    columns: columnOrder,
    groups,
  } = (await getGridCacheData()) ?? {};
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity] = pathname.split("/");

  const _pluck = ["id", "code", "status", "created_date", "updated_date"];
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
        entity: main_entity!,
        title: 'Devices',
        columnsOrder: columnOrder,
        columns: gridColumns,
        defaultValues: {
          categories: ['Contact', 'Employee'],
          id: 'code'
        },
        paginationType: 'default',
        defaultShownColumns: ['raw_phone_number', 'email'],
        enableAutoCreate: true,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchConfig: {
          router: 'grid',
          resolver: 'items',
          query_params: {
            entity: main_entity!,
            pluck: _pluck,
            group_advance_filters: filters?.groupAdvanceFilters,
          },
        },
      }}
      customCreateButton={<CustomCreateButton entity={main_entity!} />}
    />
  );
}
