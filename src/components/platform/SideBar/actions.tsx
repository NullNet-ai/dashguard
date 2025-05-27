'use server'
import { api } from '~/trpc/server'

export const getPathLink = async (entity: string) => {
  const redirectPath = await api.tab.getEntityLastPath({
    entity,
  })
  return redirectPath?.redis
}
