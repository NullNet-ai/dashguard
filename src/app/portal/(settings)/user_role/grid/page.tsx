import { headers } from 'next/headers'
import React from 'react'

import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'
import { api } from '~/trpc/server'

import gridColumns from './_config/columns'
import { defaultSorting } from './_config/sorting'

export default async function UserRoleGridPage({
  searchParams = {},
}: {
  searchParams?: {
    page?: string
    perPage?: string
  }
}) {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, ,] = pathname.split('/')
  const _pluck = [
    'id',
    'entity',
    'categories',
    'code',
    'role',
    'status',
    'created_date',
    'created_time',
    'created_by',
    'updated_date',
    'updated_time',
    'updated_by',
  ]

  const { sorting } = (await getGridCacheData()) ?? {}

  const { items = [], totalCount } = await api.grid.items({
    entity: main_entity!,
    pluck: _pluck,
    current: +(searchParams.page ?? '0'),
    limit: +(searchParams.perPage ?? '100'),
    sorting: sorting?.length ? sorting : defaultSorting,
  })

  return (
    <Grid
      config={{
        entity: main_entity!,
        title: 'User Roles',
        columns: gridColumns,
        enableAutoCreate: false,
      }}
      data={items}
      defaultSorting={defaultSorting}
      sorting={sorting?.length ? sorting : []}
      totalCount={totalCount || 0}
    />
  )
}
