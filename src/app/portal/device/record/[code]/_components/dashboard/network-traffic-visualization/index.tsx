import React from 'react'

import NetworkFlowProvider from './Provider'
import NetworkFlowView from './View'

function NetworkTrafficFlow() {
  return (
    <NetworkFlowProvider>
      <NetworkFlowView />
    </NetworkFlowProvider>
  )
}

export default NetworkTrafficFlow
