import React from 'react'

import FilterProvider from './FilterProvider'
import FilterView from './FilterView'

function Filter() {
  return (
    <div>
      <FilterProvider>
        <FilterView />
      </FilterProvider>
    </div>
  )
}

export default Filter
