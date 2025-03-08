import React from 'react'

import { ManageFilterProvider } from './components/SideDrawer/Provider'
import FilterProvider from './FilterProvider'
import FilterView from './FilterView'
import { columns } from './components/SideDrawer/config'

function Filter() {
  

  const tab = {
    name: 'New Filter',
  }

  return (
    <ManageFilterProvider columns={columns} tab={tab}>
      <FilterProvider>
        <FilterView />
      </FilterProvider>
    </ManageFilterProvider>
  )
}

export default Filter
