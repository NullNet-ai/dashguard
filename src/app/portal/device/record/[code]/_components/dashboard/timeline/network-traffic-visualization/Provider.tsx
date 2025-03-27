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
  const [bandwidth, setBandwidth] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [time, setTime] = useState<Record<string, any> | null>(null)
  const [current_index, setCurrentIndex] = useState<number>(0)
  const [unique_source_ips, setUniqueSourceIP] = useState<string[]>([])

  const getBandwidthActions = api.packet.getBandwidthOfSourceIP.useMutation()
  const getUniqueSourceActions = api.packet.getUniqueSourceIP.useMutation()

  const {
    time_count = null,
    time_unit = null,
    resolution = null,
  } = time || {}

  const { refetch: refetchTimeUnitandResolution } = api.cachedFilter.fetchCachedFilterTimeUnitandResolution.useQuery(
    {
      type: 'timeline_filter',
      filter_id: filterId,
    }, {
      enabled: false,
    }
  )

  const fetchBandwidth = async (add_data_count: number) => {
    const bandwidth = await getBandwidthActions.mutateAsync({
      device_id: params?.id || '',
      time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
      bucket_size: resolution,
      source_ips: unique_source_ips?.slice(current_index, current_index + add_data_count) || [],
    },)

    if (!bandwidth) return

    if (current_index == 0) {
      setBandwidth(bandwidth?.data || [])
      return
    }

    setBandwidth((prev: any) => [
      ...(prev || []),
      ...(bandwidth?.data || []),
    ])
  }

  const fetchMoreData = async () => {
    if (!unique_source_ips || unique_source_ips.length === 0) {
      console.warn('No source IPs available for fetching bandwidth')
      return
    }

    if (current_index + 2 > unique_source_ips.length) return
    setCurrentIndex(current_index + 2)

    fetchBandwidth(2)
  }

  useEffect(() => {
    if (!eventEmitter) return

    const setFID = (data: any) => {
      if (typeof data !== 'string') return
      setFilterID(data)
    }
    const setSBy = (data: any) => {
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
    if (!filterId) return

    setLoading(true)
    const fetchTimeUnitandResolution = async () => {
      const {
        data: time_unit_resolution,
      } = await refetchTimeUnitandResolution()

      const { time, resolution = '1h' } = time_unit_resolution || {}
      const { time_count = 12, time_unit = 'hour' } = time || {}
      setTime({
        time_count,
        time_unit: time_unit as 'hour',
        resolution: resolution as '1h',
      })
    }
    fetchTimeUnitandResolution()
  }, [filterId, (searchBy ?? [])?.length])

  useEffect(() => {
    if (!time_count || !time_unit || !resolution) return
    if (!filterId) return

    const fetchUniqueSourceIP = async () => {
      const data = await getUniqueSourceActions.mutateAsync({
        device_id: params?.id || '',
        time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
        filter_id: filterId,
      })

      setUniqueSourceIP(data as string[])
      setCurrentIndex(0)
      setLoading(false)
    }

    setTimeout(() => fetchUniqueSourceIP(), 500) // delay to wait for the searchBy to be set in redis
  }, [time_count, time_unit, resolution, (searchBy ?? [])?.length])

  useEffect(() => {
    if (!unique_source_ips || unique_source_ips.length === 0) {
      console.warn('No source IPs available for fetching bandwidth')
      return
    }
    if (bandwidth?.length == unique_source_ips.length) return
    setCurrentIndex(current_index + 20)

    fetchBandwidth(20)
  }, [unique_source_ips])

  const state = {
    flowData: bandwidth,
    loading,
    unique_source_ips,
    fetchMoreData,

  } as any

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
