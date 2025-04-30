'use server';
import React from 'react';

import Grid from '~/components/platform/Grid';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { api } from '~/trpc/server';

import ArchiveDialog from '../_components/controls/ArchiveDialog';

import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { customArchive } from './customArchiveAction';
import ArchiveComponent from './customDefaultActions/Archive';
import DeleteComponent from './customDefaultActions/Delete';
import { resolveGridParams } from '~/utils/grid-params-resolver';

export default async function OrganizationGridPage(): Promise<React.ReactElement | null> {
  const _pluck = [
    'id',
    'code',
    'name',
    'categories',
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
      entity: 'organization',
    });

  const { items = [], totalCount } = await api.grid.items({
    ...gridParams,
  });

  return (
    <Grid
      config={{
        entity: 'organization',
        paginationType:'simple-card',
        title: 'Organizations',
        columns: gridColumns,
        columnsOrder: columnOrder,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        deleteCustomComponent: DeleteComponent,
        archiveCustomAction: customArchive,
        archiveCustomComponent: ArchiveComponent,
        archiveDialogCustomComponent: ArchiveDialog,
        searchConfig: {
          router: 'grid',
          resolver: 'items',
          query_params: {
            entity: 'organization',
            pluck: _pluck,
            group_advance_filters: filters?.groupAdvanceFilters,
          },
        },
      }}
      data={items}
      defaultSorting={sorts?.defaultSorting || defaultSorting}
      defaultAdvanceFilter={filters?.defaultFilters || []}
      advanceFilter={filters?.advanceFilter || []}
      sorting={sorts?.sorting?.length ? sorts?.sorting : defaultSorting}
      pagination={pagination}
      totalCount={totalCount || 0}
      grouping={groups || []}
    />
  );
}
