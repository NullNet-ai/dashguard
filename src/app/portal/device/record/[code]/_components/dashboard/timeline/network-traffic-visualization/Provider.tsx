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
  const [filterId, setFilterID] = useState('01JNQ9WPA2JWNTC27YCTCYC1FE')
  const [searchBy, setSearchBy] = useState()
  const [bandwidth, setBandwidth] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [ time , setTime] = useState<Record<string,any> | null>(null)

  const {
    time_count = null,
    time_unit  = null,
    resolution  = null
  } = time || {}

  const { refetch } = api.packet.getBandwidthOfSourceIP.useQuery(
    {
      device_id: params?.id || '',
      time_range: getLastTimeStamp(time_count, time_unit ) as any,
      filter_id: filterId,
      bucket_size: resolution,
    },
    {
      enabled: false, // Disable automatic query execution
    }
  )

  const { refetch: refetchTimeUnitandResolution } = api.cachedFilter.fetchCachedFilterTimeUnitandResolution.useQuery(
    {
      type: 'timeline_filter',
      filter_id: filterId,
    },
    {
      enabled: false, 
    }
  )
  

  useEffect(() => {
    if (!eventEmitter) return
    const setFID =  async(data:any ) => {
      
      if(typeof data !== 'string')return

      setFilterID(data)
      }
    const setSBy = (data:any) => {
      setSearchBy(data)
    }

    eventEmitter.on(`timeline_filter_id`, data => setFID(data))
    eventEmitter.on('timeline_search', setSBy)
    return () => {
      eventEmitter.off(`timeline_filter_id`, setFID)
      eventEmitter.off(`timeline_search`, setSBy)
    }
  }, [eventEmitter])
  

  useEffect(() => {
    
    if (filterId) {
      setLoading(true)
     const fetchTimeUnitandResolution = async() => {
        const {
          data:  time_unit_resolution
        } = await refetchTimeUnitandResolution()
    
          const {time, resolution = '1h'} = time_unit_resolution || {}
          const {time_count = 12, time_unit = 'hour' } = time || {}
          setTime({
            time_count,
            time_unit: time_unit  as 'hour',
            resolution: resolution as '1h'
          })
      }
      fetchTimeUnitandResolution()
    }
  }, [filterId, (searchBy ?? [])?.length])

  useEffect(() => {
    if(!time_count || !time_unit || !resolution) return 
    if (filterId) {
     setTimeout(async() =>{

      
      const { data } =  await refetch() 
      
      setBandwidth(data)
      setLoading(false)
    },500
    )
    }
  }, [time_count, time_unit, resolution, (searchBy ?? [])?.length])

  useEffect(() => {
    if(!params?.id || !refetch) return 

    const fetchBandwidth = async() => {
      const a =  await refetch() 
      
      const { data }  = a
      if(!data) return
      setBandwidth(data)
    }
    
    fetchBandwidth()
  }, [params?.id])


  const state = {
    elements: generateFlowData(bandwidth ?? []),
    loading
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
