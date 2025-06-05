'use server'

import { api } from '~/trpc/server'

export const fetchSearchFilter = async ({filter_type}: {filter_type: string}) => {
  // const urlSearchParams = new URLSearchParams(searchParams)

  
  const cached_filter = await api.cachedFilter.fetchCachedFilter({
    type: filter_type,
  })

  

  return cached_filter

  // urlSearchParams.set('advanceFilterItem', filterItemId || '')

  // redirect(`${pathName}?${urlSearchParams}`)
}
