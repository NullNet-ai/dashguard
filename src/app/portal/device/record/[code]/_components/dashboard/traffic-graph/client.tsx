'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import {
  Card,
  CardContent,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
} from '~/components/ui/chart'
import { api } from '~/trpc/react'

import { renderChart } from './function/renderChart'
import moment from 'moment-timezone'
import { IFormProps } from '../types'
import Filter from '../timeline/Filter'
import Search from '../timeline/Search'
import { timeDuration } from '../timeline/Search/configs'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { Loader } from '~/components/ui/loader';
import { useSocketConnection } from '../custom-hooks/useSocketConnection';
import { updateFilteredData } from './function/updateFilteredData'


const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  bandwidth: {
    label: 'Bandwidth:',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone


const channel_name = 'connection_traffic_graph'

const TrafficGraph = ({defaultValues, params}: IFormProps) => {
  const eventEmitter = useEventEmitter()
  const chartScrollRef = useRef<HTMLDivElement>(null)
  const [_resolution, setResolution] = React.useState<null | string>(null)
  const [graphType, setGraphType] = React.useState('default')
  const [loading, setLoading] = useState<boolean>(false)
  const [filterId, setFilterID] = useState('01JNQ9WPA2JWNTC27YCTCYC1FE')
  // const [filterUpdateId, setFilterUpdateId] = useState("01JNQ9WPA2JWNTC27YCTCYC1FE")
  const [token, setToken] = React.useState<string | null>(null)
  const [orgID, setOrgID] = React.useState<string | null>(null)
  const [filteredData, setFilteredData] = React.useState<any[]>([])
  const {socket} = useSocketConnection({channel_name, token})
  const [{
    time_count,
    time_unit,
    resolution
  }, setTime] = useState<any>(timeDuration)
  const [searchBy, setSearchBy] = useState()
  const cardTitle = React.useMemo(() => {
    return graphType === 'bar' ? 'Bar Chart' : graphType === 'line' ? 'Line Chart' : 'Area Chart'
  }, [graphType])

  const getAccount = api.organizationAccount.getAccountID.useMutation();
  const taskQueueRef = useRef<Array<() => Promise<void>>>([])
  const isQueueWorkerRunningRef = useRef(false)
  const isQueueEnabledRef = useRef(true)
  const queueEpochRef = useRef(0)
  const isUnmountedRef = useRef(false)
  const startQueueServiceRef = useRef<(() => void) | null>(null)

  const startQueueService = useCallback(() => {
    if (isQueueWorkerRunningRef.current) return
    isQueueWorkerRunningRef.current = true

    void (async () => {
      try {
        while (!isUnmountedRef.current) {
          if (!isQueueEnabledRef.current) break
          const next = taskQueueRef.current.shift()
          if (!next) break
          try {
            await next()
          } catch (err) {
            console.error('[traffic-graph] queue task failed', err)
          }
        }
      } finally {
        isQueueWorkerRunningRef.current = false
        if (!isUnmountedRef.current && isQueueEnabledRef.current && taskQueueRef.current.length > 0) {
          startQueueServiceRef.current?.()
        }
      }
    })()
  }, [])

  useEffect(() => {
    startQueueServiceRef.current = startQueueService
  }, [startQueueService])

  const enqueueTask = useCallback((task: () => Promise<void>) => {
    if (!isQueueEnabledRef.current) return
    taskQueueRef.current.push(task)
    startQueueServiceRef.current?.()
  }, [])

  const stopQueueService = useCallback(() => {
    isQueueEnabledRef.current = false
    queueEpochRef.current += 1
    taskQueueRef.current = []
  }, [])

  const resumeQueueService = useCallback(() => {
    if (isUnmountedRef.current) return
    isQueueEnabledRef.current = true
    startQueueServiceRef.current?.()
  }, [])
const { refetch: refetchTimeUnitandResolution } = api.cachedFilter.fetchCachedFilterTimeUnitandResolution.useQuery(
    {
      type: 'traffic_graph_filter',
      filter_id: filterId,
    },
    {
      enabled: false, 
    }
  )
    useEffect(() => {
      if (filterId) {
        stopQueueService()
        setLoading(true)
        const fetchTimeUnitandResolution = async() => {
          const {
            data:  time_unit_resolution
          } = await refetchTimeUnitandResolution()
            const {time, resolution = '1h', graph_type = "area"} = time_unit_resolution || {}
            const {time_count = 12, time_unit = 'hour' } = time || {}
            setTime({
              time_count,
              time_unit: time_unit  as 'day' | 'hour',
              resolution: resolution as '1h'
            })
            setGraphType(graph_type ?? "area")
            resumeQueueService()
            setLoading(false)
        }
        fetchTimeUnitandResolution()
      }
    }, [filterId, (searchBy ?? [])?.length, refetchTimeUnitandResolution, resumeQueueService, stopQueueService])

     useEffect(() => {
        if (!eventEmitter) return
        const setFID =  async(data:any ) => {
          if(typeof data !== 'string')return
    
          setFilterID(data)
      
          }
        const setSBy = (data:any) => {
          setSearchBy(data)
        }
    
        eventEmitter.on(`traffic_graph_filter_id`, data => setFID(data))
        // eventEmitter.on('traffic_graph_filter_manage_filter', data => 
        //   setFilterUpdateId(data?.modifyFilterDetails?.id)
        // )
        
        eventEmitter.on('traffic_graph_search', setSBy)
        return () => {
          eventEmitter.off(`traffic_graph_filter_id`, setFID)
          // eventEmitter.off(`traffic_graph_filter_manage_filter`, setFID)
          eventEmitter.off(`traffic_graph_search`, setSBy)
        }
      }, [eventEmitter])

  const timeRangeFormat = () => {
    setResolution(null)
    if(filterId === '01JNQ9WPA2JWNTC27YCTCYC1FE') {
      return getLastTimeStamp({count: 2, unit: 'minute', _now: new Date(), add_remaining_time: true, })
    }
    return getLastTimeStamp({count: time_count, unit: time_unit, _now: new Date(), add_remaining_time: true, })
  }
  

  const getBandwidth = api.packet.getBandwith.useMutation()
  const [packetsIP, setPacketsIP] = useState<any[]>([])
  
  const enqueueRefetch = useCallback(() => {
    if (!isQueueEnabledRef.current) return
    const epochAtEnqueue = queueEpochRef.current
    enqueueTask(async () => {
      console.debug('[pooling] getBandwidth')
      const tr = timeRangeFormat() as any
      const res = await getBandwidth.mutateAsync({
        bucket_size: resolution,
        time_range: tr,
        timezone,
        // @ts-expect-error - No type yet
        device_id: params.id,
      })
      if (isUnmountedRef.current) return
      if (!isQueueEnabledRef.current) return
      if (queueEpochRef.current !== epochAtEnqueue) return
      setPacketsIP(res || [])
      setLoading(false)
    })
  }, [enqueueTask, getBandwidth, params?.id, resolution])

    useEffect(() => {
      if(!packetsIP?.length) return
      const _data = packetsIP?.map((item) => {
        const date = moment(item.bucket)
        if((time_count === 12 && time_unit === 'hour' || time_count === 1 && time_unit === 'day')) {
        return {
          ...item,
          bucket: date.format('HH:mm:ss')
        }
      }
      return {...item, bucket: date.format('MM/DD')}
    })
    setFilteredData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(_data)) return prev;
      return [..._data].slice(-100); // Limit to the last 100 records
    });
  },[packetsIP])   


   useEffect(() => {
      const _getAccount = async () => { 
        const res = await getAccount.mutateAsync()
        const { organization_id, token } = res || {}
        setOrgID(organization_id)
        setToken(token)
      }
      
      _getAccount()

      // Eviction: Keep only the last 100 records
      return () => {
        isUnmountedRef.current = true
        taskQueueRef.current = []
        setFilteredData([])
      }
      
    }, [])


  useEffect(() => {
    console.debug('[socket] event - traffic_graph_connection listener isnt created yet')
    if (!socket || !defaultValues?.id || !orgID || filterId !== '01JNQ9WPA2JWNTC27YCTCYC1FE') return
    console.debug('[socket] event - traffic_graph_connection listener created')
    socket.on( `traffic_graph_connection-${defaultValues?.id}-${orgID}`, (data: Record<string,any>) => {
      console.debug(`[socket] event - connection_multi_graph-${defaultValues?.id}-${orgID} - data`, data)

      const updated_filtered_data =  updateFilteredData(filteredData, data)
      setFilteredData(updated_filtered_data)
      
    })

    // const debouncedUpdate = debounce((data) => {
    //   setFilteredData((prev) => updateFilteredData(prev, data));
    // }, 300);
    
    // socket.on(`traffic_graph_connection-${defaultValues?.id}-${orgID}`, (data: Record<string, any>) => {
    //   debouncedUpdate(data);
    // });

    return () => {
      socket.off(`traffic_graph_connection-${defaultValues?.id}-${orgID}`); // Clean up the listener
    };
  },[socket, filteredData, orgID, defaultValues?.id, filterId])

  useEffect(() => {
    isUnmountedRef.current = false
    enqueueRefetch()
  }, [resolution, time_unit, time_count, graphType, filterId, enqueueRefetch])

  useEffect(() => {
    const twelveHoursMs = 2000 // 12 * 60 * 60 * 1000
    const interval = window.setInterval(() => {
      if (loading) return
      enqueueRefetch()
    }, twelveHoursMs)

    return () => {
      window.clearInterval(interval)
    }
  }, [enqueueRefetch])

  useEffect(() => {
    const el = chartScrollRef.current
    if (!el) return

    const raf = requestAnimationFrame(() => {
      el.scrollTo({ left: el.scrollWidth, behavior: 'auto' })
    })

    return () => cancelAnimationFrame(raf)
  }, [filteredData])

  useEffect(() => {
      if (!filterId) return
  
      eventEmitter.emit('timeline_filter_id_active_label', filterId)
    }, [filterId])

  return (
    <div className=" mx-auto max-w-[calc(100vw-39em)]">
      <div className='sticky top-[29px] z-[50] bg-white'>
        <div className="px-2">
          {/* <Filter params={params} type='traffic_graph_filter'  /> */}
          {/* <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} filter_type='traffic_graph_search' /> */}
        </div>
    {loading ? <Loader
      className="bg-primary text-primary"
      label="Fetching data..."
      size="md"
      variant="circularShadow"
    /> : <Card> 
      {/* <CardContent className="px-2 pt-4 sm:px-2 sm:pt-6"> */}
      <CardContent>
        <ChartContainer
          ref={chartScrollRef}
          className="aspect-auto h-full w-full overflow-x-auto"
          config={chartConfig}
        >

            {renderChart({ filteredData, graphType })}

        </ChartContainer>
      </CardContent>
    </Card>}</div>
    </div>
  )
}

export default TrafficGraph
