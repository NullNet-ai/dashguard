'use server'

import { api } from '~/trpc/server'

import { AppRouterKeys } from '../types'

export async function FetchInfiniteData({ resolver, router, query_params, entity }: {
  resolver: any
  router: AppRouterKeys
  query_params: any
  entity: string
}) {
  // @ts-expect-error has error
  const getData = await api[router][resolver]({ entity, query_params }).then((data) => {
    if (!data)
      return []
    return data
  })

  return getData
}
