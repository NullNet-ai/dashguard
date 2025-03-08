import React from 'react'

import Filter from './Filter'
import NetworkTrafficFlow from './network-traffic-visualization'
import Main from './Search'

function TimelineComponent({ params, defaultValues }: any) {
  console.log('%c Line:9 🥟 params', 'color:#4fff4B', { defaultValues, params })

  return (
    <div className=" mx-auto">
      <Filter />

      <Main />
      <NetworkTrafficFlow params={params} />

    </div>
  )
}

export default TimelineComponent
