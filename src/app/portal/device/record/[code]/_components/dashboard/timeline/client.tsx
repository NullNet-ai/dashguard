import React from 'react'

import Filter from './Filter'
import NetworkTrafficFlow from './network-traffic-visualization'
import Search from './Search'
import { Card } from '~/components/ui/card'

function TimelineComponent({ params }: any) {

  return (
    <Card className="overflow-hidden p-4 max-w-[calc(100vw-3em)] md:max-w-[calc(100vw-28em)] lg:max-w-full">
      <div className='relative z-[50] pb-4'>
        <Filter params={params} type='timeline_filter'  />
        <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} filter_type='timeline_search' />
      </div>
      <NetworkTrafficFlow params={params} />

    </Card>
  )
}

export default TimelineComponent
