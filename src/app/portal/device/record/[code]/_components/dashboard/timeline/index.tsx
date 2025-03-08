import React from 'react'

import Filter from './Filter'
import Main from './Search'
import NetworkTrafficFlow from '../network-traffic-visualization'


function TimelineComponent() {

  return (
    <div className="container mx-auto mt-10">
      <Filter />
  
      <Main />
      <NetworkTrafficFlow />

    </div>
  )
}

export default TimelineComponent
