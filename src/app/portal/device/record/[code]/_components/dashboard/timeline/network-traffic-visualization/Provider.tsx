'use client'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { type INetworkFlowContext } from './types'
import { useSocketConnection } from '../../custom-hooks/useSocketConnection';
import { updateBandwidth } from './functions/updateBandwidth';
import { useRouter } from 'next/navigation'

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
  const [isQueueEnabled, setIsQueueEnabled] = useState(false)
  const taskQueueRef = useRef<Array<() => Promise<void>>>([])
  const isQueueWorkerRunningRef = useRef(false)
  const isUnmountedRef = useRef(false)
  const startQueueServiceRef = useRef<(() => void) | null>(null)
  const currentIndexRef = useRef(0)
  const uniqueSourceIpsRef = useRef<string[]>([])

  const router = useRouter()

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

  const clearIsNewAfterDelay = useCallback((ips: string[], delayMs = 1000) => {
    if (!ips?.length) return
    window.setTimeout(() => {
      if (isUnmountedRef.current) return
      setNewBandwidth((prev: any[]) => {
        if (!prev?.length) return prev
        const ipSet = new Set(ips)
        return prev.map((entry: any) => (ipSet.has(entry?.source_ip) ? { ...entry, isNew: false } : entry))
      })
    }, delayMs)
  }, [])
  
  const startQueueService = useCallback(() => {
    if (isQueueWorkerRunningRef.current) return
    isQueueWorkerRunningRef.current = true

    void (async () => {
      try {
        while (!isUnmountedRef.current) {
          const next = taskQueueRef.current.shift()
          if (!next) break
          try {
            await next()
          } catch (err) {
            console.error('[network-flow] queue task failed', err)
          }
        }
      } finally {
        isQueueWorkerRunningRef.current = false
        if (!isUnmountedRef.current && taskQueueRef.current.length > 0) {
          startQueueServiceRef.current?.()
        }
      }
    })()
  }, [])

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  useEffect(() => {
    startQueueServiceRef.current = startQueueService
  }, [startQueueService])

  const enqueueTask = useCallback((task: () => Promise<void>) => {
    taskQueueRef.current.push(task)
    if (isQueueEnabled) startQueueServiceRef.current?.()
  }, [isQueueEnabled])

  useEffect(() => {
    currentIndexRef.current = current_index
  }, [current_index])

  useEffect(() => {
    uniqueSourceIpsRef.current = unique_source_ips
  }, [unique_source_ips])

  const fetchBandwidth = useCallback(async (startIndex: number, add_data_count: number, isInitial = false) => {  
    const getBandwidthParams = {
      device_id: params?.id || '',
      time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
      bucket_size: resolution,
      // @ts-expect-error - No type yet
      source_ips: (searchBy && searchBy.length) ? uniqueSourceIpsRef.current : (uniqueSourceIpsRef.current?.slice(startIndex, startIndex + add_data_count) || []),
    }

    const _bandwidth: any = await getBandwidthActions.mutateAsync(getBandwidthParams);
    
    if (!_bandwidth) return; // Exit early if no bandwidth data is returned
    
    if (startIndex === 0) {
      // If it's the first batch, replace the data
      setNewBandwidth(
        _bandwidth?.data?.map((item: Record<string, any>) => {
          return { ...item, time_unit, time_count, resolution, time_range };
        }) || []
      );
      return;
    }

    let updated_new_bandwidth = new_bandwidth?.map((entry: any) => ({
      ...entry,
      isNew: false,
    }))

    // @ts-expect-error - No type yet
    _bandwidth.data.forEach(e => {
      // @ts-expect-error - No type yet
      updated_new_bandwidth = updated_new_bandwidth.reduce((acc, curr) => {
        if(curr?.source_ip === e?.source_ip) {
          return [...acc, { ...curr, result: [...curr.result, ...e.result] }]
        }
        return [...acc, { ...curr, time_unit, time_count, resolution, time_range }]
      }, [])
    })

    setNewBandwidth(updated_new_bandwidth)
   
  }, [getBandwidthActions, params?.id, resolution, time_count, time_range, time_unit, searchBy])
  
  
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
    if (!socket || !org_acc_id || filterId !== '01JNQ9WPA2JWNTC27YCTCYC1FE' ) return;
  
    const eventKey = `${channel_name}-${params?.id}-${org_acc_id}`;
    socket.on(eventKey, async (data: any) => {
      // if((searchBy ?? [])?.length && !(searchBy as any)?.[0]?.values?.includes(data?.source_ip)) return
      const updated_bandwidth = await updateBandwidth(new_bandwidth, data, time, searchBy);
      setNewBandwidth([...updated_bandwidth])
      clearIsNewAfterDelay(
        (updated_bandwidth || []).filter((e: any) => e?.isNew).map((e: any) => e?.source_ip).filter(Boolean),
      )
    });
  
    // Cleanup function to remove the event listener
    return () => {
      socket.off(eventKey);
    };
  }, [socket, org_acc_id, new_bandwidth, clearIsNewAfterDelay]);
  
  

  const fetchMoreDataInternal = useCallback(async () => {
    console.debug('[pooling] fetchMoreData')
    if(!filterId && filterId === '01JNQ9WPA2JWNTC27YCTCYC1FE') return
    const ips = uniqueSourceIpsRef.current
    if (!ips || ips.length === 0) {
      console.warn('No source IPs available for fetching new_bandwidth')
      return
    }

    const startIndex = currentIndexRef.current
    const addCount = 2
    if (startIndex + addCount > ips.length) return

    setCurrentIndex(startIndex + addCount)
    currentIndexRef.current = startIndex + addCount

    await fetchBandwidth(startIndex, addCount)
  }, [fetchBandwidth, filterId])
  
  const fetchMoreDataInternalV2 = useCallback(async () => {
    console.debug('[pooling] fetchMoreDataV2')
    if(!filterId && filterId === '01JNQ9WPA2JWNTC27YCTCYC1FE') return
    const ips = uniqueSourceIpsRef.current
    if (!ips || ips.length === 0) {
      console.warn('No source IPs available for fetching new_bandwidth')
      return
    }

    const tr = getLastTimeStamp({ count: 2, unit: 'second', add_remaining_time: true }) as any
    // const trV2 = getLastTimeStamp({ count: 60, unit: 'second', add_remaining_time: true }) as any
    const data = await getUniqueSourceActions.mutateAsync({
    device_id: params?.id || '',
    time_range: tr, // trV2
    filter_id: filterId,
  });
    // Get Connections
    const getBandwidthParams = {
      device_id: params?.id || '',
      time_range: tr, // trV2, // tr,
      bucket_size: resolution,
      source_ips: data, // uniq([...data, ...ips]).slice(20)
    }
    const _bandwidth: any = await getBandwidthActions.mutateAsync(getBandwidthParams);

    // setNewBandwidth(_bandwidth?.data?.map((item: Record<string, any>) => {
    //   return { ...item, time_unit, time_count, resolution, time_range };
    // }) || [])

    // return

    let updated_new_bandwidth = new_bandwidth

    // @ts-expect-error - No type yet
    let realNewBandwidths = []
    // @ts-expect-error - No type yet
    _bandwidth.data.forEach(e => {
      let isExist = false
      // @ts-expect-error - No type yet
      updated_new_bandwidth = updated_new_bandwidth.reduce((acc, curr) => {
        if(curr?.source_ip === e?.source_ip) {
          isExist = true
          return [...acc, { ...curr, result: [...curr.result, ...e.result] }]
        }
        return [...acc, curr]
      }, [])
      if (!isExist) {
        realNewBandwidths.push({ ...e, time_unit, time_count, resolution, time_range, isNew: true })
      }
    })

    // @ts-expect-error - No type yet
    setNewBandwidth([...realNewBandwidths, ...updated_new_bandwidth].slice(0, 25))
    clearIsNewAfterDelay(
      // @ts-expect-error - No type yet
      (realNewBandwidths || []).map((e: any) => e?.source_ip).filter(Boolean),
    )
  }, [fetchBandwidth, filterId])

  const fetchMoreData = useCallback(async () => {
    enqueueTask(fetchMoreDataInternal)
  }, [enqueueTask, fetchMoreDataInternal])

  useEffect(() => {
    if (!isQueueEnabled) return
    const interval = window.setInterval(() => {
      enqueueTask(fetchMoreDataInternalV2)
    }, 2000)

    return () => {
      window.clearInterval(interval)
    }
  }, [enqueueTask, fetchMoreDataInternalV2, isQueueEnabled])

  useEffect(() => {
    if (!eventEmitter) return

    const setFID = (data: any) => {
      if (typeof data !== 'string') return
      setFilterID(data)
    }
    const setSBy = (data: any) => {
      setSearchBy(data)
    }

    const handleRefresh = async (data: boolean) => {
      if (!!data) {
        setLoading(true); // Set loading to true before starting the fetch
    
        try {
          // Fetch time unit and resolution
          const fetchTimeUnitandResolution = async () => {
            const { data: time_unit_resolution } = await refetchTimeUnitandResolution();
        
            const { time, resolution = '1s' } = time_unit_resolution || {};
            const { time_count = 1, time_unit = 'hour' } = time || {};
        
            setTime({
              time_count,
              time_unit: time_unit as 'hour',
              resolution: resolution as '1h',
            });
        
            return { time_count, time_unit, resolution };
          };
        
          const { time_count, time_unit = null, resolution } = await fetchTimeUnitandResolution(); // Await the fetch to ensure it completes
        
          // Ensure time_count, time_unit, and resolution are valid before proceeding
          if (!time_count || !time_unit || !resolution) return;
          if (!filterId) return;
        
          // Fetch unique source IPs
          const fetchUniqueSourceIP = async () => {
            const data = await getUniqueSourceActions.mutateAsync({
              device_id: params?.id || '',
              // @ts-expect-error - No type yet
              time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
              filter_id: filterId,
            });
        
            setUniqueSourceIP(data as string[]);
            setCurrentIndex(0);
            uniqueSourceIpsRef.current = data as string[]
            currentIndexRef.current = 0
            setLoading(false);
          };
        
          await fetchUniqueSourceIP(); // Trigger fetchUniqueSourceIP directly after fetchTimeUnitandResolution
        
          // Fetch bandwidth data
          fetchBandwidth(0, 25); // Trigger fetchBandwidth
        } catch (error) {
          console.error('Error during handleRefresh:', error); // Log the error for debugging
        } finally {
          setLoading(false); // Ensure loading is set to false after the fetch completes
        }
      }
    };

    eventEmitter.on(`timeline_filter_id`, setFID)
    eventEmitter.on('timeline_search', setSBy)
    eventEmitter.on('should_refresh_timeline_filter', handleRefresh)
    return () => {
      eventEmitter.off(`timeline_filter_id`, setFID)
      eventEmitter.off(`timeline_search`, setSBy)
      eventEmitter.off('should_refresh_timeline_filter', handleRefresh)
    }
  }, [eventEmitter, filterId])

  useEffect(() => {
    if (!filterId) return

    setLoading(true)
    const fetchTimeUnitandResolution = async () => {
      const {
        data: time_unit_resolution,
      } = await refetchTimeUnitandResolution()
      
      const { time, resolution = '1s' } = time_unit_resolution || {}
      const { time_count = 1, time_unit = 'hour' } = time || {}
      
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
      uniqueSourceIpsRef.current = data as string[]
      currentIndexRef.current = 0
      setLoading(false)
    }

    setTimeout(() => fetchUniqueSourceIP(), 1000) // delay to wait for the searchBy to be set in redis
  }, [filterId, time_count, time_unit, resolution, (searchBy ?? [])?.length])

  useEffect(() => {
    const bandwidthIps = new_bandwidth?.map((entry: {
      source_ip: string
    }) => entry.source_ip) || []

    const areIpsSame
      = bandwidthIps.length === unique_source_ips.length
        && unique_source_ips.every(ip => bandwidthIps.includes(ip))

    if (areIpsSame) return

    setCurrentIndex(prevIndex => prevIndex + 25)
    setNewBandwidth([])
    //  filterId !== '01JNQ9WPA2JWNTC27YCTCYC1FE' && fetchBandwidth(0, 20)
    setIsQueueEnabled(false)
    taskQueueRef.current = []
    void (async () => {
      await fetchBandwidth(0, 25, true)
      setIsQueueEnabled(true)
      startQueueServiceRef.current?.()
    })()
  }, [unique_source_ips])

  useEffect(() => {
    if (!filterId) return

    eventEmitter.emit('timeline_filter_id_active_label', filterId)
  }, [filterId])

const chartData = useMemo(() => new_bandwidth,[new_bandwidth])

  useEffect(() => {
    eventEmitter.emit('timeline_chart_data', chartData)
  }, [chartData])

  useEffect(() => {
    eventEmitter.emit('timeline_loading', loading)
  }, [loading])

  const state = {
    flowData: new_bandwidth,
    loading,
    unique_source_ips,
    fetchMoreData,
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
