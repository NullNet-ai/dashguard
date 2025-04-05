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

export const updateMainTabItem = async (tab: any, entity: string) => {
  await api.tab.updateMainTabItem({
    tab,
    entity,
  })
}

export const updateAllMaindata2 = async (tabs: any[]) => {
  await api.tab.updateAllMainTabs2({
    tabs,
  })
}
