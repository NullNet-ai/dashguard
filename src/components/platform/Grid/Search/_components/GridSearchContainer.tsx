'use client'

import React from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { cn } from '~/lib/utils'

const GridSearchContainer = ({ children }: any) => {
  const { state } = useSideDrawer()
  const { isOpen, isPinned } = state

  return (
    <div className={cn(`ml-0 mt-0 flex w-full max-w-[100%] flex-col justify-end gap-x-2 sm:mt-0 lg:ml-2 lg:mt-0 lg:w-[55%] `, `${(isOpen && isPinned) ? 'lg:max-w-[40%]' : 'lg:max-w-[55%]'} `)}>
      {children}
    </div>
  )
}

export default GridSearchContainer
