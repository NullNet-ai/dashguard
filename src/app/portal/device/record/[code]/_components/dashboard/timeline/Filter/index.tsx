import React from 'react'

import { columns } from './components/SideDrawer/config'
import { ManageFilterProvider } from './components/SideDrawer/Provider'
import FilterProvider from './FilterProvider'
import FilterView from './FilterView'
import { IFormProps } from '../../types'

function Filter({params, type}: {
  params:any,
  type: string
}) {
  const tab = {
    name: 'New Filter',
  }
  
  console.log('%c Line:19 🥥 type', 'color:#33a5ff', type);
  return (
    <ManageFilterProvider columns={columns} tab={tab}  filter_type={type}>
      <FilterProvider params={params} type={type}>
        <FilterView />
      </FilterProvider>
    </ManageFilterProvider>
  )
}

export default Filter
