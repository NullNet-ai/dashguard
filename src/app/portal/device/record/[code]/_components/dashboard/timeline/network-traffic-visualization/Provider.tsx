'use client'
import React, {
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { generateFlowData } from './functions/generateFlowData'
import { type INetworkFlowContext } from './types'

const NetworkFlowContext = React.createContext<INetworkFlowContext>({
})

interface IProps extends PropsWithChildren {
  params?: {
    id: string
    shell_type: 'record' | 'wizard'
    entity: string
  }
}

export default function NetworkFlowProvider({ children, params }: IProps) {
  const eventEmitter = useEventEmitter()
  const [filterId, setFilterID] = useState()
  const [searchBy, setSearchBy] = useState()
  const [bandwidth, setBandwidth] = useState<any>(null)

  const { refetch } = api.packet.getBandwidthOfSourceIP.useQuery(
    {
      device_id: params?.id || '',
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

    eventEmitter.on(`filter_id`, data => setFID(data))
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
  }, [filterId, (searchBy ?? [])?.length])
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

  const state = {
    elements: generateFlowData(bandwidth ?? {}),
  }

  return (
    <NetworkFlowContext.Provider
      value={{
        state,
      } }
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
