'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '~/trpc/server'

export const closeClassTab = async ({
  pathname,
  current,
}: {
  pathname: string
  current?: boolean
}) => {
  await api.tab.closeCurrentClassTab({
    href: pathname,
  })

  // if (!current) {
  //   redirect(currentPathname)
  // }
  // redirect(tab?.href || '/portal/dashboard')
}

export const closeAllClassTabs = async () => {
  await api.tab.closeAllClassTabs()
  redirect('/portal/dashboard')
}

export const closeOtherClassTabs = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string
  current?: any
  tabs?: any
}) => {
  await api.tab.closeOtherClassTabs({
    href: pathname,
  })
  redirect(pathname)
}
