import { headers } from 'next/headers'
import React from 'react'

import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'

import gridColumns from './_config/columns'
import { defaultSorting } from './_config/sorting'

export default async function ConfigurationRuleGrid() {
  const { sorting } = (await getGridCacheData()) ?? {}
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity] = pathname.split('/')
  // const _pluck = [
  //   'id',
  //   'code',
  //   'created_date',
  //   'updated_date',
  //   'status',
  //   'instance_name',
  //   'created_by',
  //   'updated_by',
  //   'model',
  // ]

  // const { items = [], totalCount } = await api.device.mainGrid({
  //   entity: main_entity!,
  //   pluck: _pluck,
  //   current: +(searchParams.page ?? "0"),
  //   limit: +(searchParams.perPage ?? "100"),
  //   sorting: sorting?.length ? sorting : defaultSorting,
  // });

  return (
    <Grid
      config={{
        entity: main_entity!,
        title: 'Device',
        columns: gridColumns,
        defaultValues: {
          entity_prefix: 'DV',
        },
      }}
      data={[]}
      defaultSorting={defaultSorting}
      sorting={sorting?.length ? sorting : []}
      totalCount={0}
    />
  )
}
