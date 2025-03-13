import React from 'react'

import Filter from './Filter'
import NetworkTrafficFlow from './network-traffic-visualization'
import Search from './Search'

function TimelineComponent({ params }: any) {

  return (
    <div className=" mx-auto">
      <Filter />

      <Search  params={params} />
      <NetworkTrafficFlow params={params} />

    </div>
  )
}

export default TimelineComponent
