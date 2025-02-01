import { EOperator } from '@dna-platform/common-orm'
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
  ]

  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: code!,
    pluck_fields: ['id'],
  })

  const { sorting, pagination, filters } = (await getGridCacheData()) ?? {}

  const record_id = record?.data?.id
  const { items = [], totalCount } = await api.deviceRule.mainGrid({
    entity: 'device_rules',
    pluck: _pluck,
    current: +(pagination?.current_page ?? '0'),
    limit: +(pagination?.limit_per_page ?? '100'),
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [
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
            entity: 'device_rules',
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
