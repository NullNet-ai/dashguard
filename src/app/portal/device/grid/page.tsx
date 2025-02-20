import { headers } from 'next/headers'

import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'
import { api } from '~/trpc/server'

import { defaultAdvanceFilter } from './_config/advanceFilter'
import gridColumns from './_config/columns'
import { defaultSorting } from './_config/sorting'
import DeleteConfirmation from './Actions/Delete/DeleteConfirmation'

export default async function Page({
  searchParams = {},
}: {
  searchParams?: {
    page?: string
    perPage?: string
  }
}) {
  const { sorting, pagination, filters } = (await getGridCacheData()) ?? {}
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity] = pathname.split('/')
  const _pluck = [
    'id',
    'code',
    'created_date',
    'updated_date',
    'status',
    'instance_name',
    'created_by',
    'updated_by',
    'model',
    'ip_address',
    'system_id',
    'device_version',
    'updated_time',
    'created_time',
    'previous_status',
  ]

  const { items = [], totalCount } = await api.device.mainGrid({
    entity: main_entity!,
    pluck: _pluck,
    current: +(pagination?.current_page ?? '0'),
    limit:+(pagination?.limit_per_page ?? '100'),
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
    // advance_filters: []
  })

  return (
    <Grid
      advanceFilter={filters?.reportFilters || []}
      config={{
        entity: main_entity!,
        title: 'Device',
        columns: gridColumns,
        defaultValues: {
          entity_prefix: 'DV',
          categories: ['Firewall'],
        },
        hideColumnsOnMobile: [],
        deleteCustomComponent: DeleteConfirmation,
        searchConfig: {
          router: 'device',
          resolver: 'mainGrid',
          query_params: {
            entity: main_entity!,
            pluck: _pluck,
          },
        },
      }}
      data={items}
      defaultAdvanceFilter={defaultAdvanceFilter || []}
      defaultSorting={defaultSorting}
      pagination={pagination}
      sorting={sorting || []}
      totalCount={totalCount || 0}
    />
  )
}
