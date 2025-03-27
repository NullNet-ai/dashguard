import React from 'react'

import Filter from './Filter'
import NetworkTrafficFlow from './network-traffic-visualization'
import Search from './Search'

function TimelineComponent({ params }: any) {

  return (
    <div className=" mx-auto">
      <div className='sticky top-[29px] z-[100] bg-white'>
        <Filter params={params} type='timeline_filter'  />
        <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} filter_type='timeline_search' />
      </div>
      <NetworkTrafficFlow params={params} />

    </div>
  )
}

export default TimelineComponent
