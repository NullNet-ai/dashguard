'use server'

import { api } from '~/trpc/server'

export const fetchSearchFilter = async () => {
  // const urlSearchParams = new URLSearchParams(searchParams)

  
  const cached_filter = await api.timelineFilter.fetchTimelineFilter({
    type: 'search',
  })

  

  return cached_filter

  // urlSearchParams.set('advanceFilterItem', filterItemId || '')

  // redirect(`${pathName}?${urlSearchParams}`)
}
