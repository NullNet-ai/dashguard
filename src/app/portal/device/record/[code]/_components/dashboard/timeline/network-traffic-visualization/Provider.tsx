'use client'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { type INetworkFlowContext } from './types'
import { useSocketConnection } from '../../custom-hooks/useSocketConnection';
import { updateBandwidth } from './functions/updateBandwidth';

const NetworkFlowContext = React.createContext<INetworkFlowContext>({
})
const channel_name = 'timeline_connections'

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
  const [new_bandwidth, setNewBandwidth] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [time, setTime] = useState<Record<string, any> | null>(null)
  const [current_index, setCurrentIndex] = useState<number>(0)
  const [unique_source_ips, setUniqueSourceIP] = useState<string[]>([])
  const [token, setToken] = React.useState<string | null>(null)
  const [org_acc_id, setOrgAccountID] = React.useState<string | null>(null)

  const {socket} = useSocketConnection({channel_name, token})
  const getAccount = api.organizationAccount.getAccountID.useMutation();

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

  // const { notifications, isConnected, disconnectSocket } = useSocketNotifications(userToken);

  const time_range = getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true })

  const fetchBandwidth = async (add_data_count: number) => {
  // const fetchBandwidth = async () => {
    const _bandwidth: any = await getBandwidthActions.mutateAsync({
      device_id: params?.id || '',
      time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
      bucket_size: resolution,
      // source_ips: unique_source_ips
      source_ips: unique_source_ips?.slice(current_index, current_index + add_data_count) || [],
    },)

    if (!_bandwidth) return

    if (current_index == 0) {
      setNewBandwidth(_bandwidth?.data?.map((item: Record<string, any>) => {
        return {...item, time_unit, time_count, resolution, time_range}
      }) || [])
      return
    }

    setNewBandwidth((prev: any) => [
      ...(prev || []),
      ...(_bandwidth?.data?.map((item: Record<string, any>) => {
        return {...item, time_unit, time_count, resolution, time_range}
      }) || []),
    ])
  }
  



  useEffect(() => {
    const _getAccount = async () => {
      const res = await getAccount.mutateAsync()
      
      const { organization_id, token } = res || {}
      setOrgAccountID(organization_id)
      setToken(token)
    }
    
    _getAccount()
  }, [])

  useEffect(() => {
    if (!socket || !org_acc_id) return;
  
    const eventKey = `${channel_name}-${params?.id}-${org_acc_id}`;
    socket.on(eventKey, (data: any) => {
      const updated_bandwidth = updateBandwidth(new_bandwidth, data);
      setNewBandwidth([...updated_bandwidth])
    });
  
    // return () => {
    //   socket.off(eventKey, handleSocketData); // Cleanup
    // };
  }, [socket, org_acc_id, new_bandwidth]);
  
  

  // const fetchMoreData = async () => {
  //   if (!unique_source_ips || unique_source_ips.length === 0) {
  //     console.warn('No source IPs available for fetching new_bandwidth')
  //     return
  //   }

  //   if (current_index + 2 > unique_source_ips.length) return
  //   setCurrentIndex(current_index + 2)

  //   fetchBandwidth(2)
  // }

  useEffect(() => {
    if (!eventEmitter) return

    const setFID = (data: any) => {
      if (typeof data !== 'string') return
      setFilterID(data)
    }
    const setSBy = (data: any) => {
      setSearchBy(data)
    }

    eventEmitter.on(`timeline_filter_id`, setFID)
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

    setTimeout(() => fetchUniqueSourceIP(), 1000) // delay to wait for the searchBy to be set in redis
  }, [time_count, time_unit, resolution, (searchBy ?? [])?.length])

  useEffect(() => {
    const bandwidthIps = new_bandwidth?.map((entry: {
      source_ip: string
    }) => entry.source_ip) || []

    const areIpsSame
      = bandwidthIps.length === unique_source_ips.length
        && unique_source_ips.every(ip => bandwidthIps.includes(ip))

    if (areIpsSame) return

    setCurrentIndex(current_index + 20)
    setNewBandwidth([])
    fetchBandwidth(10)
  }, [unique_source_ips])

const chartData = useMemo(() => new_bandwidth,[new_bandwidth])

  const state = {
    flowData: new_bandwidth,
    loading,
    unique_source_ips,
    // fetchMoreData,
    chartData

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
