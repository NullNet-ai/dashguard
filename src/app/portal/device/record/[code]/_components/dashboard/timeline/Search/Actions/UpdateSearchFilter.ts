'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

import { type ISearchItem } from '../types'

export async function UpdateSearchFilter({
  filters,
  filterItemId,
  filter_type
}: {
  filters: ISearchItem[]
  filterItemId?: string
  filter_type: string
}) {
  const headerList = headers()
  const pathName = headerList.get('x-pathname') || ''
  const searchParams = headerList.get('x-full-search-query-params') || ''
  // const urlSearchParams = new URLSearchParams(searchParams)
  
  await api.cachedFilter.updateSearchFilter({
    type: filter_type,
    data: filters,
  })

  

  // urlSearchParams.set('advanceFilterItem', filterItemId || '')

  // redirect(`${pathName}?${urlSearchParams}`)
}
