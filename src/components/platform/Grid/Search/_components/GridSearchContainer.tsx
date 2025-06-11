'use client'

import React from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { cn } from '~/lib/utils'

const GridSearchContainer = ({ children }: any) => {
  const { state } = useSideDrawer()
  const { isOpen, isPinned } = state

  return (
    <div className={cn(`ml-0 mt-0 flex w-full max-w-full flex-row-reverse justify-end gap-2 sm:mt-0 2xl:flex-col`)}>
      {children}
    </div>
  )
}

export default GridSearchContainer
