'use server'
import { api } from '~/trpc/server'

export const updateAllInnerdata = async (tabs: any[], context: string) => {
  await api.tab.updateAllSubTabs({
    current_context: context,
    tabs,
  })
}

export const updateAllMaindata = async (tabs: any[]) => {
  await api.tab.updateAllMainTabs({
    tabs,
  })
}
