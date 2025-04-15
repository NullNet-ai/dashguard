import { headers } from 'next/headers'
import React from 'react'

import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'
import { api } from '~/trpc/server'

import gridColumns from './_config/columns'
import { defaultSorting } from './_config/sorting'

export default async function ConfigurationAliasGrid({
  searchParams = {},
}: {
  searchParams?: {
    page?: string
    perPage?: string
  }
}) {
  const { sorts, filters , pagination} = (await getGridCacheData()) ?? {}
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity,,code] = pathname.split('/')
  const _pluck = [
    'id',
    'device_configuration_id',
    'type',
    'name',
    'value',
    'description',
    'created_by',
    'updated_by',
    'created_date',
    'updated_date',
    'updated_time',
    'created_time',
    'status',
  ]

  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: code!,
    pluck_fields: ['id'],
  })

  const record_id = record?.data?.id

  const { items = [], totalCount } = await api.deviceAlias.mainGrid({
    entity: 'device_aliases',
    pluck: _pluck,
    current: +(pagination?.current_page ?? "0"),
    limit: +(pagination?.limit_per_page ?? "100"),
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
    is_case_sensitive_sorting: "false",
    device_id: record_id,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  })

  return (
    <Grid
    parentType="record"
    totalCount={totalCount || 0}
    data={items}
    defaultSorting={defaultSorting}
    defaultAdvanceFilter={ []}
    advanceFilter={filters?.reportFilters || []}
    sorting={sorts?.sorting || []}
    pagination={pagination}
    config={{
      entity: 'device_aliases',
      title: 'Aliases',
      columns: gridColumns,
      defaultValues: {
        entity_prefix: 'DV',
      },
      disableDefaultAction: true,
      hideCreateButton: true,
      searchConfig: {
        router: 'deviceAlias',
        resolver: 'mainGrid',
        query_params: {
          entity: 'device_aliases',
          pluck: _pluck,
        },
      },
    enableRowSelection: false,
    }}
  />
  )
}
