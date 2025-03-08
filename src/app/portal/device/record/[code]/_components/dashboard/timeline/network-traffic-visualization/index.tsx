import React from 'react'

import FilterProvider from '../Filter/FilterProvider'

import NetworkFlowProvider from './Provider'
import NetworkFlowView from './View'

function NetworkTrafficFlow(props: any) {
  return (
    <FilterProvider>
      <NetworkFlowProvider {...props}>
        <NetworkFlowView />
      </NetworkFlowProvider>
    </FilterProvider>
  )
}

export default NetworkTrafficFlow
