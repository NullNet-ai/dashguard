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
import { Loader } from '~/components/ui/loader';
import { useSocketConnection } from '../custom-hooks/useSocketConnection';
import { updateFilteredData } from './function/updateFilteredData'


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


const channel_name = 'connection_traffic_graph'

const TrafficGraph = ({defaultValues, params}: IFormProps) => {
  const eventEmitter = useEventEmitter()
  const [_resolution, setResolution] = React.useState<null | string>(null)
  const [graphType, setGraphType] = React.useState('default')
  const [loading, setLoading] = useState<boolean>(false)
  const [filterId, setFilterID] = useState('01JP0WDHVNQAVZN14AA')
  const [filterUpdateId, setFilterUpdateId] = useState("01JP0WDHVNQAVZN14AA")
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
        eventEmitter.on('traffic_graph_filter_manage_filter', data => 
          setFilterUpdateId(data?.modifyFilterDetails?.id)
        )
        
        eventEmitter.on('traffic_graph_search', setSBy)
        return () => {
          eventEmitter.off(`traffic_graph_filter_id`, setFID)
          eventEmitter.off(`traffic_graph_filter_manage_filter`, setFID)
          eventEmitter.off(`traffic_graph_search`, setSBy)
        }
      }, [eventEmitter])
  
  const timeRangeFormat = React.useMemo(() => {
    setResolution(null)
    return getLastTimeStamp({count: time_count, unit: time_unit})
  }, [ time_count, time_unit])
  


  const { data: packetsIP = [], refetch } = api.packet.getBandwith.useQuery(
    {
      bucket_size: resolution,
      time_range: timeRangeFormat as any,
      timezone,
      device_id: defaultValues?.id,
    }, { enabled:false })
  

    useEffect(() => {
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
    setFilteredData(_data)
  },[packetsIP])   
   useEffect(() => {
      const _getAccount = async () => { 
        const res = await getAccount.mutateAsync()
        const { organization_id, token } = res || {}
        setOrgID(organization_id)
        setToken(token)
      }
      
      _getAccount()
      
    }, [])


  useEffect(() => {
    if (!socket || !defaultValues?.id || !orgID) return
   
    socket.on( `traffic_graph_connection-${defaultValues?.id}-${orgID}`, (data: Record<string,any>) => {
      const updated_filtered_data =  updateFilteredData(filteredData, data)
      setFilteredData(updated_filtered_data)
      
    })

    // return () => {
    //   socket.off(`traffic_graph_connection-${defaultValues?.id}-${orgID}`); // Clean up the listener
    // };
  },[socket, filteredData, orgID, defaultValues?.id])

  // useEffect(() => {
  //   refetch()
  //   setLoading(false)

  //   const interval = setInterval(() => {
  //     refetch()
  //   }, 1000)
  //   return () => {
  //     clearInterval(interval)
  //   }
  // }
  // , [resolution, time_unit, time_count, graphType])


  return (
    <>
    <Filter params={params} type='traffic_graph_filter'  />
    <Search  params={{...params, router: 'packet', resolver: 'filterConnections' }} filter_type='traffic_graph_search' />
    {  loading ? <Loader
      className="bg-primary text-primary"
      label="Fetching data..."
      size="md"
      variant="circularShadow"
    /> : <Card>
      
      <CardContent className="px-2 pt-4 sm:px-2 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-full w-full p-5 overflow-x-auto"
          config={chartConfig}
        >

            {renderChart({ filteredData, graphType })}

        </ChartContainer>
      </CardContent>
    </Card>}
    </>
  )
}

export default TrafficGraph
