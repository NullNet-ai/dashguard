import React from 'react'

import NetworkFlow from '../network-traffic-visualization'

import Filter from './Filter'
import Main from './Search'

function TimelineComponent() {
  return (
    <div className="container mx-auto mt-10">
      <Filter />
      <Main />
      <NetworkFlow />

    </div>
  )
}

export default TimelineComponent
