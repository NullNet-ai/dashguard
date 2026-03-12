import React from 'react'

import Filter from './Filter'
import NetworkTrafficFlow from './network-traffic-visualization'
import Search from './Search'
import { Card } from '~/components/ui/card'

function TimelineComponent({ params }: any) {

  return (
    <Card className="p-4 max-w-[calc(100vw-3em)] md:max-w-[calc(100vw-28em)] lg:max-w-full">
      <div className='relative z-[50] mb-2'>
        <Filter params={params} type='timeline_filter'  />
      </div>
      <div className="flex flex-col">
        <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} filter_type='timeline_search' />
        <NetworkTrafficFlow params={params} />
      </div>

    </Card>
  )
}

export default TimelineComponent
