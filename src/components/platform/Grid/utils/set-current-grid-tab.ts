'use server'
import { api } from '~/trpc/server'

interface ISetCurrentGridTab {
  gridTabId: string
  gridKey?: string
  application?: string
  identifier?: string
  pathname?: string
  entity?: string
}

export const setCurrentGridTab = async (
  args?: ISetCurrentGridTab,
) => {
  if (!args?.gridTabId) {
    return
  }
  await api.grid.setCurrentGridTab(args)
}
