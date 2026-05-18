import { headers } from 'next/headers';

import Grid from '~/components/platform/Grid';

import { api } from '~/trpc/server';

import { defaultSorting } from './_config/sorting';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { CustomNewButton } from './_components/CustomNewButton';
import gridColumns from './_config/columns';
import { CustomRowActions } from './_components/CustomRowActions';

export default async function Page() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, ,] = pathname.split('/');
  const _pluck = [
    'id',
    'categories',
    'code',
    'status',
    'remote_access_type',
    'remote_access_category',
    'remote_access_session',
    'remote_access_status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
  ];

  const gridCacheData =
    (await getGridCacheData({
      defaultSorting: defaultSorting,
    })) ?? {};
  const { gridParams, gridProps } = gridDataResolver({
    entity: main_entity!,
    pluck: _pluck,
    gridCacheData,
    defaults: {
      defaultSorting,
    },
  });
  const { items = [], totalCount } = await api.deviceRemoteAccessSession.mainGrid({
    ...gridParams,
  });

  return (
    // <Grid
    //   {...gridProps}
    //   data={items}
    //   totalCount={totalCount || 0}
    //   config={{
    //     enableRowClick: false,
    //     entity: main_entity!,
    //     title: 'Remote Access',
    //     columns: gridColumns,
    //     columnsOrder: gridCacheData?.columns,
    //     disableDefaultAction: true,
    //     customRowAction: CustomRowActions,
    //     searchConfig: {
    //       router: 'deviceRemoteAccessSession',
    //       resolver: 'mainGrid',
    //       query_params: {
    //         entity: main_entity!,
    //         pluck: _pluck,
    //       },
    //     },
    //   }}
    //   customCreateButton={
    //     <CustomNewButton />
    //   }
    // />
    <Grid
    // advanceFilter={filters?.advanceFilter || []}
    {...gridProps}
    config={{
      entity: main_entity!,
      title: 'Remote Access',
      columns: gridColumns,
      defaultValues: {
        entity_prefix: 'RA',
      },
      disableDefaultAction: true,
      enableRowClick: false,
      customRowAction: CustomRowActions,
      searchConfig: {
        router: 'deviceRemoteAccessSession',
        resolver: 'mainGrid',
        query_params: {
          entity: main_entity!,
          pluck: _pluck,
        },
      },
      searchSuggestionConfig: {
        router: 'search',
        resolver: 'deviceRemoteAccessSessionSearch',
      }
    }}
    customCreateButton={
      <CustomNewButton />
    }
    
    data={items}
    // defaultAdvanceFilter={defaultAdvanceFilter || []}
    defaultSorting={defaultSorting}
    // pagination={pagination}
    // sorting={sorts?.sorting?.length ? sorts?.sorting : []}
    totalCount={totalCount || 0}
  />
  );
}
