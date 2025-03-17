'use client'

import React, { useEffect, useState } from 'react'

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


const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  bandwidth: {
    label: 'Bandwidth',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const TrafficGraph = ({defaultValues, params}: IFormProps) => {
  const eventEmitter = useEventEmitter()
  const [_resolution, setResolution] = React.useState<null | string>(null)
  const [graphType, setGraphType] = React.useState('default')
    const [filterId, setFilterID] = useState('01JP0WDHVNQAVZN14AA')
 const [{
    time_count,
    time_unit,
    resolution
  }, setTime] = useState(timeDuration)
   const [searchBy, setSearchBy] = useState()
  const cardTitle = React.useMemo(() => {
    return graphType === 'bar' ? 'Bar Chart' : graphType === 'line' ? 'Line Chart' : 'Area Chart'
  }, [graphType])

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
        const fetchTimeUnitandResolution = async() => {
          const {
            data:  time_unit_resolution
          } = await refetchTimeUnitandResolution()
            const {time, resolution = '1h', graph_type = "area"} = time_unit_resolution || {}
            const {time_count = 12, time_unit = 'hour' } = time || {}
            setTime({
              time_count,
              time_unit: time_unit  as 'hour',
              resolution: resolution as '1h'
            })

            setGraphType(graph_type)
        }
        fetchTimeUnitandResolution()
      }
    }, [filterId, (searchBy ?? [])?.length])

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
        eventEmitter.on('traffic_graph_search', setSBy)
        return () => {
          eventEmitter.off(`traffic_graph_filter_id`, setFID)
          eventEmitter.off(`traffic_graph_search`, setSBy)
        }
      }, [eventEmitter])
  
  const timeRangeFormat = React.useMemo(() => {
    setResolution(null)
    return getLastTimeStamp(time_count, time_unit)
  }, [ time_count, time_unit])
  


  const { data: packetsIP = [], refetch } = api.packet.getBandwith.useQuery(
    {
      bucket_size: resolution,
      time_range: timeRangeFormat,
      timezone,
      device_id: defaultValues?.id,
    }, {enabled:false})

  const filteredData = packetsIP?.map((item) => {
    const date = moment(item.bucket)
    if((time_count === 12 && time_unit === 'hour')) {
      return {
        ...item,
        bucket: date.format('HH:mm:ss')
      }
    }
    return {...item, bucket: date.format('MM/DD')}
  })

  useEffect(() => {
    refetch()
  }
  , [resolution, time_unit,time_count, graphType, filterId, searchBy])

  return (
    <>
    <Filter params={params} type='traffic_graph_filter'  />
    <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} />
    <Card>
      
      <CardContent className="px-2 pt-4 sm:px-2 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-full w-full p-5 overflow-x-auto"
          config={chartConfig}
        >

            {renderChart({ filteredData, graphType })}

        </ChartContainer>
      </CardContent>
    </Card>
    </>
  )
}

export default TrafficGraph
