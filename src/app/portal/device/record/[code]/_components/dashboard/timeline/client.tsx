import React from 'react'

import Filter from './Filter'
import NetworkTrafficFlow from './network-traffic-visualization'
import Search from './Search'

function TimelineComponent({ params }: any) {

  return (
    <div className=" mx-auto">
      <Filter params={params} type='timeline'  />

      <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} />
      <NetworkTrafficFlow params={params} />

    </div>
  )
}

export default TimelineComponent
