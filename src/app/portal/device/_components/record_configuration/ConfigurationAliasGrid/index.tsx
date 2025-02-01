import { EOperator } from '@dna-platform/common-orm'
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
  const { sorting } = (await getGridCacheData()) ?? {}
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
    current: +(searchParams.page ?? '0'),
    limit: +(searchParams.perPage ?? '100'),
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: [
      {
        type: 'criteria',
        field: 'device_id',
        entity: 'device_configurations',
        operator: EOperator.EQUAL,
        values: [
          record_id,
        ],
      },
      {
        type: 'operator',
        operator: 'and',
      },
      {
        type: 'criteria',
        field: 'status',
        entity: 'device_aliases',
        operator: EOperator.EQUAL,
        values: [
          'Active',
        ],
      },
    ],
  })

  return (
    <Grid
      config={{
        entity: 'device_aliases',
        title: 'Aliases',
        columns: gridColumns,
        defaultValues: {
          entity_prefix: 'DV',
        },
        disableDefaultAction: true,
        hideCreateButton: true,
      }}
      data={items}
      defaultSorting={defaultSorting}
      sorting={sorting?.length ? sorting : []}
      totalCount={totalCount}
    />
  )
}
