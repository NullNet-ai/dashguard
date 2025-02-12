import { headers } from 'next/headers'
import React from 'react'

import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'
import { api } from '~/trpc/server'

import gridColumns from './_config/columns'
import { defaultSorting } from './_config/sorting'

export default async function ConfigurationRuleGrid() {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity,,code] = pathname.split('/')
  const _pluck = [
    'id',
    'device_configuration_id',
    'device_rule_status',
    'status',
    'type',
    'policy',
    'protocol',
    'source_port',
    'source_addr',
    'destination_port',
    'destination_addr',
    'description',
    'created_by',
    'updated_by',
    'created_date',
    'updated_date',
    'disabled',
  ]

  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: code!,
    pluck_fields: ['id'],
  })

  const { sorting, pagination, filters } = (await getGridCacheData()) ?? {}

  const record_id = record?.data?.id as string
  const { items = [], totalCount } = await api.deviceRule.mainGrid({
    entity: 'device_rules',
    pluck: _pluck,
    current: +(pagination?.current_page ?? '0'),
    limit: +(pagination?.limit_per_page ?? '100'),
    sorting: sorting?.length ? sorting : defaultSorting,
    device_id: record_id,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  })

  return (
    <Grid
      parentType="record"
      config={{
        entity: 'device_rules',
        title: 'Rules',
        columns: gridColumns,
        defaultValues: {
          entity_prefix: 'DR',
        },
        disableDefaultAction: true,
        hideCreateButton: true,
        searchConfig: {
          router: 'deviceRule',
          resolver: 'mainGrid',
          query_params: {
            entity: 'device_rules',
            pluck: _pluck,
          },
        },
      }}
      data={items}
      defaultSorting={defaultSorting}
      sorting={sorting?.length ? sorting : []}
      totalCount={totalCount}
    />
  )
}
