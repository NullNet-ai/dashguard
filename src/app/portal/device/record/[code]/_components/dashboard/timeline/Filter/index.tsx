import React from 'react'

import { columns } from './components/SideDrawer/config'
import { ManageFilterProvider } from './components/SideDrawer/Provider'
import FilterProvider from './FilterProvider'
import FilterView from './FilterView'
import { IFormProps } from '../../types'

function Filter({params}: any) {
  const tab = {
    name: 'New Filter',
  }

  return (
    <ManageFilterProvider columns={columns} tab={tab}>
      <FilterProvider params={params}>
        <FilterView />
      </FilterProvider>
    </ManageFilterProvider>
  )
}

export default Filter
