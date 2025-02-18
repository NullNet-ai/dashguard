'use server'
import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

export const customDeleteAction = async (args: Record<string, any>) => {
  const { id } = args
  const entity = 'organization'

  return await api.organization
    .getOrganizationByParentIds({ parent_organization_ids: [id] })
    .then(async (res) => {
      if (res.length) {
        return { message: 'Organization has sub organizations assigned' }
      }
      await api.grid.archiveRecord({
        entity,
        id,
      })
      redirect(`/portal/${entity}/grid`)
    })
}
