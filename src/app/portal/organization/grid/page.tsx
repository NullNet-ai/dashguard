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
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';

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

  const gridCacheData = (await getGridCacheData()) ?? {};

    const { gridParams, gridProps } = gridDataResolver({
      entity: 'organization',
      pluck: _pluck,
      gridCacheData,
      defaults: {
        defaultSorting,
      },
    });

  const { items = [], totalCount } = await api.grid.items({
    ...gridParams,
  });

  return (
    <Grid
      {...gridProps}
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: 'organization',
        paginationType:'simple-card',
        title: 'Organizations',
        columns: gridColumns,
        columnsOrder: gridCacheData?.columns,
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
            group_advance_filters: gridCacheData?.filters?.groupAdvanceFilters,
          },
        },
      }}
    />
  );
}
