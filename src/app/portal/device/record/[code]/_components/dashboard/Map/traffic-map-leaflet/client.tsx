'use client'

import Bluebird from 'bluebird'
import { useEffect, useState } from 'react'

import { getFlagDetails } from '~/app/api/device/get_flags'
import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import Filter from '../../timeline/Filter'
import Search from '../../timeline/Search'
import { type IFormProps } from '../../types'

import MapComponent from './components/MapComponent'
import { additionalCityConnections, cityToCityConnections, regionToCityConnections, regionToRegionConnections } from './functions'

export default function TrafficMaps({ params }: IFormProps) {
  const eventEmitter = useEventEmitter()
  const [filterId, setFilterID] = useState('01JNQ9WPA2JWNTC27YCTCYC1FE')
  const [searchBy, setSearchBy] = useState()
  const [bandwidth, setBandwidth] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [time, setTime] = useState<Record<string, any> | null>(null)
  const [current_index, setCurrentIndex] = useState<number>(0)
  const [unique_source_ips, setUniqueSourceIP] = useState<string[]>([])
  const [country_traffic_data, setCountryTrafficData] = useState<any>({})
  const [addition_city_connections, setAdditionCityConnections] = useState<any>([])
  const [region_to_region_connections, setRegionToRegionConnections] = useState<any>([])
  const [region_to_city_connections, setRegionToCityConnections] = useState<any>([])
  const [city_to_city_connections, setCityToCityConnections] = useState<any>([])

  const getBandwidthActions = api.packet.getBandwidthOfSourceIP.useMutation()
  const getUniqueSourceActions = api.packet.getUniqueSourceIP.useMutation()
  const getCountryIP = api.packet.getCountriesSourceIP.useMutation()

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
    const _bandwidth: any = await getBandwidthActions.mutateAsync({
      device_id: params?.id || '',
      time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
      bucket_size: resolution,
      source_ips: unique_source_ips?.slice(current_index, current_index + add_data_count) || [],
    },)

    if (!_bandwidth) return

    if (current_index == 0) {
      setBandwidth(_bandwidth?.data || [])
      return
    }

    setBandwidth((prev: any) => [
      ...(prev || []),
      ...(_bandwidth?.data || []),
    ])
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
      console.log('%c Line:137 🌮 data', 'color:#ea7e5c', data)

      setUniqueSourceIP(data as string[])
      setCurrentIndex(0)
      setLoading(false)
    }

    setTimeout(() => fetchUniqueSourceIP(), 1000) // delay to wait for the searchBy to be set in redis
  }, [time_count, time_unit, resolution, (searchBy ?? [])?.length])

  useEffect(() => {
    if (!unique_source_ips || unique_source_ips.length === 0) {
      console.warn('No source IPs available for fetching bandwidth')
      return
    }

    console.log('%c Line:134 🍷 unique_source_ips', 'color:#ea7e5c', unique_source_ips)
    const fetchCountryIP = async () => {
      const data = await getCountryIP.mutateAsync({
        source_ips: unique_source_ips,
        time_range: getLastTimeStamp({ count: time_count, unit: time_unit, add_remaining_time: true }) as any,
      })
      console.log("%c Line:141 🍭 data", "color:#7f2b82", data);

      const formattedData: Record<string, { city: string, trafficLevel: number }> = {}

      // Collect all async calls in an array
      const promises = data.flatMap(item => item.result.map(async (entry) => {
        const { country } = entry
        const city = entry.city || 'Unknown City'

        try {
          const flagDetails = await getFlagDetails(country)

          const { name: country_name } = flagDetails ?? {}
          if (!country_name) return // Skip if country name is missing

          formattedData[country_name] = {
            city: `${city}, ${country_name}`,
            trafficLevel: Math.floor(Math.random() * 100), // Assign a random traffic level
          }
        }
        catch (error) {
          console.error(`Error fetching flag details for ${country}:`, error)
        }
      })
      )

      await Promise.all(promises) // Wait for all async calls to complete

      console.log(formattedData, '#####formattedData')

      const _additionalCityConnections = await additionalCityConnections(data)
      const _regionToRegionConnections = await regionToRegionConnections(data)
      const _regionToCityConnections = await regionToCityConnections(data)
      const _cityToCityConnections = await cityToCityConnections(data)

      setAdditionCityConnections(_additionalCityConnections.filter(Boolean))
      setRegionToRegionConnections(_regionToRegionConnections.filter(Boolean))
      setRegionToCityConnections(_regionToCityConnections.filter(Boolean))
      setCityToCityConnections(_cityToCityConnections.filter(Boolean))

      setCountryTrafficData(formattedData) // Now formattedData has values

      // setBandwidth(async (prev) => {
      // // Merge data and bandwidth based on IP
      //   const combinedData = bandwidth.map((bwEntry) => {
      //     const matchingData = data.find(entry => entry.ip === bwEntry.source_ip)
      //     return matchingData ? { ...matchingData, result: bwEntry.result } : bwEntry
      //   })

      //   return combinedData
      // })
    }

    fetchCountryIP()
  }, [unique_source_ips])

  useEffect(() => {
    // if (!unique_source_ips || unique_source_ips.length === 0) {
    //   console.warn('No source IPs available for fetching bandwidth');
    //   return;
    // }

    const bandwidthIps = bandwidth?.map((entry: {
      source_ip: string
    }) => entry.source_ip) || []

    const areIpsSame
          = bandwidthIps.length === unique_source_ips.length
            && unique_source_ips.every(ip => bandwidthIps.includes(ip))

    if (areIpsSame) return

    setCurrentIndex(current_index + 20)
    setBandwidth([])
    fetchBandwidth(20)
  }, [unique_source_ips])

  console.log('%c Line:210 🍺 countryTrafficData', 'color:#42b983', country_traffic_data, addition_city_connections, city_to_city_connections, region_to_city_connections, region_to_region_connections)
  return (
    <div>
      <Filter params={params} type='map_filter' />
      <Search filter_type = 'map_search' params = { { ...params, router: 'packet', resolver: 'filterPackets' } } />
      <h1>Traffic Flow to Philippines Server</h1>
      {/* <MapComponent countryTrafficData={countryTrafficData} /> */}
      {Object.keys(country_traffic_data).length > 0 ? ( // Ensure countryTrafficData is not empty
        <MapComponent additionalCityConnections = { true } additionalCityConnections = { addition_city_connections } cityToCityConnections = { city_to_city_connections } countryTrafficData={country_traffic_data} regionToCityConnections = { region_to_city_connections } regionToRegionConnections = { region_to_region_connections } />
      ) : (
        <p>Loading map data...</p> // Show a loading message while data is being prepared
      )}

    </div>
  )
}
