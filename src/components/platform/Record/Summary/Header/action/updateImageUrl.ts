'use server'

import { api } from '~/trpc/server'

export const handleSaveUrl = async ({
  id,
  entity,
  params,
}: {
  id: string
  entity: string
  params: Record<string, any>
}) => {
  const { data } = await api.record.updateDynamicRecord({
    id,
    entity,
    data: params,
  })

  return data
}
