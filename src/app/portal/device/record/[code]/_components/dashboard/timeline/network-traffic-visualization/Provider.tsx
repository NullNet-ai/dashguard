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
  
  const [elements, setElements] = useState<{ nodes: FlowElement[], edges: Edge[] }>({ nodes: [], edges: [] })
  const [filterId, setFilterID] = useState()
  const [searchBy, setSearchBy] = useState()
  const [bandwidth, setBandwidth] = useState<any>(null)
  
  
  // const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})

  console.log('%c Line:41 🥑', 'color:#6ec1c2',  {
    device_id: params?.id,
    time_range: getLastTimeStamp(1, 'minute'),
    filter_id: filterId || '1',
  });
  const { refetch } = api.packet.getBandwidthOfSourceIP.useQuery(
    {
      device_id: params?.id,
      time_range: getLastTimeStamp(1, 'minute'),
      filter_id: filterId || '1',
    },
    {
      enabled: false, // Disable automatic query execution
    }
  )
  

  useEffect(() => {
    if (!eventEmitter) return
    const setFID =  (data:any ) => {
        
        setFilterID(data)
      }
    const setSBy = (data:any) => {
      
      setSearchBy(data)
    }
    
    eventEmitter.on(`filter_id`, (data) => setFID(data))
    eventEmitter.on('timeline_search', setSBy)
    return () => {
      eventEmitter.off(`filter_id`, setFID)
      eventEmitter.off(`filter_id`, setSBy)
    }
  }, [eventEmitter])
  

  useEffect(() => {

    
    if (filterId) {
      
     setTimeout(async() =>{
      const { data } =  await refetch() 
      
      setBandwidth(data)
    },500
  
    )
    }
  }, [filterId, searchBy?.length])
  // const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  // const { data: bandwidth } = api.packet.getBandwidthOfSourceIP.useQuery(
  //   { packet_data: packetsIP }, { enabled: !!packetsIP }
  // )
  // 

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
