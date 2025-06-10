'use client'

import React from 'react'

import Search from '../Search'
import Sorting from '../Sorting'
import GridTabs from '../Tabs/Tabs'

export default function MobileHeader({  gridKey,
  grid_tabs} : any) {
  return (
    <div className="flex flex-col py-2 pb-0 lg:flex-row lg:justify-between">
      <div className='mb-2 lg:mb-0'>
        <GridTabs gridKey={gridKey} grid_tabs={grid_tabs}/>
      </div>
      <Sorting />
      <Search />
    </div>
  )
}
