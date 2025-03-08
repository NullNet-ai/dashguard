import React from 'react'

import Filter from './Filter'
import Main from './Search'
import NetworkTrafficFlow from '../network-traffic-visualization'


function TimelineComponent() {

  return (
    <div className=" mx-auto">
      <Filter />
  
      <Main />
      <NetworkTrafficFlow />

    </div>
  )
}

export default TimelineComponent
