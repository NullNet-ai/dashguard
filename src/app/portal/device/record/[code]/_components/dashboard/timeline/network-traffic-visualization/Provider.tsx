'use client'
import React, {
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

import { FilterContext, useFilter } from '../Filter/FilterProvider'

import { generateFlowData } from './functions/generateFlowData'
import { mock_bandwidth } from './functions/mock_bandwidth'
import { type INetworkFlowContext, type Edge, type FlowElement } from './types'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

const NetworkFlowContext = React.createContext<INetworkFlowContext>({
})

interface IProps extends PropsWithChildren {
  test?: any
  params?: {
    id: string
    shell_type: 'record' | 'wizard'
    entity: string
  }
}

export default function NetworkFlowProvider({ children, params }: IProps) {
  const eventEmitter = useEventEmitter()
  // const { state: filterState } = useFilter()
  const _context = useContext(FilterContext)
  console.log('%c Line:27 🍧 filterState', 'color:#6ec1c2', { _context, params })
  const [elements, setElements] = useState<{ nodes: FlowElement[], edges: Edge[] }>({ nodes: [], edges: [] })
  const [filterId, setFilterID] = useState()
  console.log('%c Line:38 🍌 filterId', 'color:#42b983', filterId)
  // const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  const { data: bandwidth, refetch } = api.packet.getBandwidthOfSourceIP.useQuery(
    {
      device_id: params?.id,
      time_range: getLastTimeStamp(1, 'minute'),
      filter_id: filterId || '1',
    }
  )

  useEffect(() => {
    if (!eventEmitter) return
    eventEmitter.on(`filter_id`, (data) => {
      console.log("%c Line:51 🌭 data", "color:#e41a6a", data);
      setFilterID(data)
    })
    // return () => {
    //   eventEmitter.off(`filter_id`)
    // }
  }, [eventEmitter])
  console.log('%c Line:36 🥛 bandwidth', 'color:#3f7cff', bandwidth)

  useEffect(() => {
    if (filterId) {
      console.log("%c Line:62 🥔 filterId", "color:#2eafb0", filterId);
      refetch()
    }
  }, [filterId])
  // const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  // const { data: bandwidth } = api.packet.getBandwidthOfSourceIP.useQuery(
  //   { packet_data: packetsIP }, { enabled: !!packetsIP }
  // )
  // console.log('%c Line:26 🍧 packetsIP', 'color:#b03734', packetsIP)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!packetsIP) {
  //       await refetch()
  //     }
  //   }
  //   fetchData().catch(error => console.error('Error fetching data:', error))
  // }, [packetsIP, refetch])

  // useEffect(() => {
  //   if (bandwidth) {
  //     setElements(generateFlowData(bandwidth))
  //   }
  // }, [bandwidth])
  const state = {
    elements: generateFlowData(bandwidth),
  }
  const actions = {}

  return (
    <NetworkFlowContext.Provider
      value={{
        state,
        actions,
      }}
    >
      {children}
    </NetworkFlowContext.Provider>
  )
}

export const useFetchNetworkFlow = (): INetworkFlowContext => {
  const context = useContext(NetworkFlowContext)
  if (!context) {
    console.warn('use Fetch Network Flow must be used within a NetworkFlowProvider')
    throw new Error('use Fetch Network Flow must be used within a NetworkFlowProvider')
  }

  return context
}
