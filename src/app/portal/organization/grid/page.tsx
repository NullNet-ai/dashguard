'use server';
import Bluebird from 'bluebird';
import React from 'react';

import Grid from '~/components/platform/Grid/Server';
import { getGridCacheData } from '~/lib/grid-get-cache-data';
import { api } from '~/trpc/server';

import ArchiveDialog from '../_components/controls/ArchiveDialog';

import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { defaultSorting } from './_config/sorting';
import { customArchive } from './customArchiveAction';
import ArchiveComponent from './customDefaultActions/Archive';
import DeleteComponent from './customDefaultActions/Delete';
import { defaultAdvanceFilter } from './_config/advanceFilter';

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

  const { sorts, pagination, filters } = (await getGridCacheData()) ?? {};

  const { items = [], totalCount } = await api.grid.items({
    current: +(pagination?.current_page ?? "0"),
    limit: +(pagination?.limit_per_page ?? "100"),
    entity: 'organization',
    pluck: _pluck,
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  });

  return (
    <Grid
      config={{
        entity: 'organization',
        title: 'Organizations',
        columns: gridColumns,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        deleteCustomComponent: DeleteComponent,
        archiveCustomAction: customArchive,
        archiveCustomComponent: ArchiveComponent,
        archiveDialogCustomComponent: ArchiveDialog,
      }}
      data={items}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultAdvanceFilter || []}
      advanceFilter={filters?.reportFilters || []}
      sorting={sorts?.sorting || []}
      pagination={pagination}
      totalCount={totalCount || 0}
    />
  );
}
