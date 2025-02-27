import { headers } from 'next/headers'
import React from 'react'

import Grid from '~/components/platform/Grid/Server'
import { getGridCacheData } from '~/lib/grid-get-cache-data'
import { api } from '~/trpc/server'

import gridColumns from './_config/columns'
import { defaultSorting } from './_config/sorting'
import { sortColumns } from '~/components/platform/Grid/utils/sortColumns'

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

  const { sorting, filters, pagination, columns } = (await getGridCacheData()) ?? {}
  console.log("🚀 ~ sorting 123:", sorting)

  const { items = [], totalCount } = await api.grid.items({
    entity: main_entity!,
    pluck: _pluck,
    current: +(pagination?.current_page ?? "0"),
    limit: +(pagination?.limit_per_page ?? "100"),
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
    ? filters?.advanceFilter
    : [],
  })

  // const orderMap = new Map(columns.map((item, index) => [item.accessorKey, item.order ?? index]));

  // const sortedGridColumns = [...gridColumns].sort((a : any, b : any) => {
  //   const orderA = orderMap.has(a.accessorKey) ? orderMap.get(a.accessorKey)! : Infinity;
  //   const orderB = orderMap.has(b.accessorKey) ? orderMap.get(b.accessorKey)! : Infinity;
  //   return orderA - orderB;
  // });

  return (
    <Grid
      config={{
        entity: main_entity!,
        title: 'User Roles',
        columns: gridColumns,
        enableAutoCreate: false,
      }}
      data={items}
      defaultSorting={sorting?.length ? sorting : defaultSorting}
      sorting={sorting?.length ? sorting : []}
      advanceFilter={filters?.defaultFilters || []}
      pagination={pagination}
      totalCount={totalCount || 0}
    />
  )
}
