'use server'

import { api } from '~/trpc/server'

const getData = async ({ config, params }: any) => {
  //
  const { router, resolver } = config

  // @ts-expect-error this error is expected
  const { items = [], totalCount } = await api[router][resolver](params)

  return { items, totalCount }
}

export default getData
