import React from 'react'

import { columns } from './components/FilterSideDrawer/config'
import { ManageFilterProvider } from './components/FilterSideDrawer/Provider'
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
  
  return (
    <ManageFilterProvider columns={columns} tab={tab}  filter_type={type}>
      <FilterProvider params={params} type={type}>
        <FilterView />
      </FilterProvider>
    </ManageFilterProvider>
  )
}

export default Filter
