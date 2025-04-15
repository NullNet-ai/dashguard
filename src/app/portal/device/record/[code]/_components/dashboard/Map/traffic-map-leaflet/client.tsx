'use client'

import type Error from 'next/error'
import { useEffect, useState, useCallback, useRef } from 'react'

import { getFlagDetails } from '~/app/api/device/get_flags'
import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import Filter from '../../timeline/Filter'
import Search from '../../timeline/Search'
import { type IFormProps } from '../../types'

import MapComponent from './components/MapComponent'

/**
 * Formats IP data with country information, handling cases where country info is missing
 * @param {Array} ipData - Array of IP data objects containing source and destination IPs
 * @returns {Object} Formatted data with country mappings and connection information
 */
export function formatIpCountryConnections(ipData: Record<string, any>) {
  // Initialize data structures
  const formattedData = {
    countryMap: {
      sourceData: {},
      destinationData: {},
    },
    connections: {
      countryToCountry: [],
      ipToIp: [],
      unknownConnections: [],
    },
  } as any

  // Process each IP entry
  ipData.forEach((entry: Record<string, any>) => {
    const { source_ip, destination_ip } = entry
    const sourceCountry = entry.source_country?.country || 'Unknown'
    const sourceCity = entry.source_country?.city || 'Unknown'
    const destCountry = entry.destination_country?.country || 'Unknown'
    const destCity = entry.destination_country?.city || 'Unknown'

    // Generate unique keys for IPs with no country info
    const sourceKey = sourceCountry === 'Unknown' ? `No IP Info_${source_ip}` : sourceCountry
    const destKey = destCountry === 'Unknown' ? `No IP Info_${destination_ip}` : destCountry

    // Format source country data
    if (!formattedData.countryMap.sourceData[sourceKey]) {
      formattedData.countryMap.sourceData[sourceKey] = {
        country: sourceCountry === 'Unknown' ? 'No IP Info' : sourceCountry,
        city: sourceCity === 'Unknown' ? 'No IP Info' : sourceCity,
        ip: source_ip,
        trafficVolume: 1,
      }
    }
    else {
      formattedData.countryMap.sourceData[sourceKey].trafficVolume += 1
    }

    // Format destination country data
    if (!formattedData.countryMap.destinationData[destKey]) {
      formattedData.countryMap.destinationData[destKey] = {
        country: destCountry === 'Unknown' ? 'No IP Info' : destCountry,
        city: destCity === 'Unknown' ? 'No IP Info' : destCity,
        ip: destination_ip,
        trafficVolume: 1,
      }
    }
    else {
      formattedData.countryMap.destinationData[destKey].trafficVolume += 1
    }

    // Create connection data
    const connection = {
      source: {
        ip: source_ip,
        country: sourceCountry,
        city: sourceCity,
      },
      destination: {
        ip: destination_ip,
        country: destCountry,
        city: destCity,
      },
      traffic: 1,
    }

    // Add connection to appropriate category
    if (sourceCountry !== 'Unknown' && destCountry !== 'Unknown') {
      formattedData.connections.countryToCountry.push(connection)
    }
    else {
      formattedData.connections.unknownConnections.push(connection)
    }

    // Always add to IP-to-IP connections for complete mapping
    formattedData.connections.ipToIp.push({
      source_ip,
      destination_ip,
      source_location: sourceCountry !== 'Unknown' ? `${sourceCity}, ${sourceCountry}` : 'Unknown location',
      destination_location: destCountry !== 'Unknown' ? `${destCity}, ${destCountry}` : 'Unknown location',
    })
  })

  // Add summary statistics
  formattedData.summary = {
    totalConnections: ipData.length,
    uniqueSourceCountries: Object.keys(formattedData.countryMap.sourceData).filter(k => !k.startsWith('No IP Info_')).length,
    uniqueDestinationCountries: Object.keys(formattedData.countryMap.destinationData).filter(k => !k.startsWith('No IP Info_')).length,
    missingCountryInfo: formattedData.connections.unknownConnections.length,
  }

  return formattedData
}

/**
 * Helper function to integrate formatted data with map visualization
 * @param {Object} formattedData - Output from formatIpCountryConnections
 * @returns {Object} Data structure compatible with MapComponent
 */
export function prepareMapComponentData(formattedData: Record<string, any>) {
  // Transform country data for map visualization
  const mapReadyData = {
    countryTrafficData: {
      sourceData: {},
      destinationData: {},
    },
    additionCityConnections: [],
    regionToRegionConnections: [],
    regionToCityConnections: [],
    cityToCityConnections: [],
  } as Record<string, any>

  // Process source country data
  Object.entries(formattedData.countryMap.sourceData).forEach(([key, data]: any) => {
    if (key.startsWith('No IP Info_')) {
      // For unknown country, create individual entries for each IP
      const ipAddress = data.ip
      mapReadyData.countryTrafficData.sourceData[`No IP Info_${ipAddress}`] = {
        city: `No IP Info, No IP Info`,
        trafficLevel: data.trafficVolume,
        source_ips: ipAddress,
      }
    }
    else if (data.country !== 'Unknown') {
      // For known countries
      mapReadyData.countryTrafficData.sourceData[data.country] = {
        city: `${data.city}, ${data.country}`,
        trafficLevel: data.trafficVolume,
        source_ips: data.ip,
      }
    }
  })

  // Process destination country data
  Object.entries(formattedData.countryMap.destinationData).forEach(([key, data]: any) => {
    if (key.startsWith('No IP Info_')) {
      // For unknown country, create individual entries for each IP
      const ipAddress = data.ip
      mapReadyData.countryTrafficData.destinationData[`No IP Info_${ipAddress}`] = {
        city: `No IP Info, No IP Info`,
        trafficLevel: data.trafficVolume,
        destination_ip: ipAddress,
      }
    }
    else if (data.country !== 'Unknown') {
      // For known countries
      mapReadyData.countryTrafficData.destinationData[data.country] = {
        city: `${data.city}, ${data.country}`,
        trafficLevel: data.trafficVolume,
        destination_ip: data.ip,
      }
    }
  })

  // Process country-to-country connections for region visualization
  formattedData.connections.countryToCountry.forEach((conn: Record<string, any>) => {
    // Add to region-to-region connections for known countries
    mapReadyData.regionToRegionConnections.push({
      source: conn.source.country,
      target: conn.destination.country,
      value: conn.traffic,
    })

    // Add city-level connections when both city data are available
    if (conn.source.city !== 'Unknown' && conn.destination.city !== 'Unknown') {
      mapReadyData.cityToCityConnections.push({
        sourceCity: `${conn.source.city}, ${conn.source.country}`,
        targetCity: `${conn.destination.city}, ${conn.destination.country}`,
        sourceIP: conn.source.ip,
        targetIP: conn.destination.ip,
        value: conn.traffic,
      })
    }
  })

  // Process connections with missing country data - handle each separately
  formattedData.connections.unknownConnections.forEach((conn: Record<string, any>) => {
    // Source known, destination unknown
    if (conn.source.country !== 'Unknown' && conn.destination.country === 'Unknown') {
      mapReadyData.regionToCityConnections.push({
        sourceRegion: conn.source.country,
        targetIP: conn.destination.ip,
        targetLocation: 'No IP Info',
        value: conn.traffic,
      })
    }
    // Destination known, source unknown
    else if (conn.source.country === 'Unknown' && conn.destination.country !== 'Unknown') {
      mapReadyData.regionToCityConnections.push({
        sourceIP: conn.source.ip,
        sourceLocation: 'No IP Info',
        targetRegion: conn.destination.country,
        value: conn.traffic,
      })
    }
    // Both source and destination countries are unknown
    else {
      mapReadyData.additionCityConnections.push({
        sourceIP: conn.source.ip,
        targetIP: conn.destination.ip,
        value: conn.traffic,
      })
    }
  })

  return mapReadyData
}

export default function TrafficMaps({ params }: IFormProps) {
  const eventEmitter = useEventEmitter()
  const [filterId, setFilterID] = useState('01JNQ9WPA2JWNTC27YCTCYC1FE')
  const [searchBy, setSearchBy] = useState()
  const [mapData, setMapData] = useState({
    countryTrafficData: {
      sourceData: {},
      destinationData: {},
    },
    additionCityConnections: [],
    regionToRegionConnections: [],
    regionToCityConnections: [],
    cityToCityConnections: [],
  })
  const [batchInfo, setBatchInfo] = useState({
    total_records: 0,
    has_more: false,
    next_offset: 0,
    is_loading: false,
    is_initial_load: true,
    should_fetch: false,
    fetch_trigger: 0,
    auto_fetch_active: false,
  })
  const [isMapDataReady, setIsMapDataReady] = useState(false)
  const [timeSettings, setTimeSettings] = useState({
    time_count: 12,
    time_unit: 'hour',
    resolution: '1h',
  })
  // Use refs to prevent dependencies triggering re-renders
  const mapDataRef = useRef(mapData)
  const batchInfoRef = useRef(batchInfo)
  const timeSettingsRef = useRef(timeSettings)

  // Update refs when state changes
  useEffect(() => {
    mapDataRef.current = mapData
  }, [mapData])

  useEffect(() => {
    batchInfoRef.current = batchInfo
  }, [batchInfo])

  useEffect(() => {
    timeSettingsRef.current = timeSettings
  }, [timeSettings])

  // API hooks
  const getUniqueSourceAndDestinationIP = api.packet.getUniqueSourceAndDestinationIP.useMutation()
  const { refetch: refetchTimeUnitandResolution } = api.cachedFilter.fetchCachedFilterTimeUnitandResolution.useQuery(
    {
      type: 'timeline_filter',
      filter_id: filterId,
    }, {
      enabled: false,
    }
  )

  // Process data and update map
  const processMapData = useCallback(async (ipData: Record<string, any>) => {
    // Use ref to get current mapData value for merging
    const currentMapData = mapDataRef.current

    try {
      // Get country details for all entries that have them
      const ipDataWithFlags = await Promise.all(ipData.map(async (entry: Record<string, any>) => {
        const updatedEntry = { ...entry }

        try {
          // Get source country flag if available
          if (entry.source_country?.country) {
            const sourceFlagDetails = await getFlagDetails(entry.source_country.country)
            if (sourceFlagDetails?.name) {
              updatedEntry.source_country = {
                ...updatedEntry.source_country,
                country: sourceFlagDetails.name,
              }
            }
          }

          // Get destination country flag if available
          if (entry.destination_country?.country) {
            const destFlagDetails = await getFlagDetails(entry.destination_country.country)
            if (destFlagDetails?.name) {
              updatedEntry.destination_country = {
                ...updatedEntry.destination_country,
                country: destFlagDetails.name,
              }
            }
          }
        }
        catch (error) {
          console.error(`Error fetching flag details:`, error)
        }

        return updatedEntry
      }))

      // Format the data with our improved utilities
      const formattedData = formatIpCountryConnections(ipDataWithFlags)
      const newMapData = prepareMapComponentData(formattedData)

      // Helper to merge arrays of connection objects
      const mergeConnections = (existing: Record<string, any>, newConnections: Record<string, any>) => {
        if (!Array.isArray(existing) || !Array.isArray(newConnections)) {
          return existing || newConnections || []
        }

        const merged = [...existing]
        const existingKeys = new Set(merged.map(item => JSON.stringify(item)))

        newConnections.filter(Boolean).forEach((item) => {
          const itemKey = JSON.stringify(item)
          if (!existingKeys.has(itemKey)) {
            merged.push(item)
            existingKeys.add(itemKey)
          }
        })

        return merged
      }

      // Merge country traffic data
      const mergedSourceData: Record<string, any> = { ...currentMapData.countryTrafficData?.sourceData || {} }
      const mergedDestData: Record<string, any> = { ...currentMapData.countryTrafficData?.destinationData || {} }

      // For source data, keep each No IP Info entry separate
      Object.entries(newMapData.countryTrafficData?.sourceData || {}).forEach(([key, data]) => {
        // If this is a No IP Info entry or a country entry, add it directly (no merging)
        mergedSourceData[key] = data
      })

      // For destination data, keep each No IP Info entry separate
      Object.entries(newMapData.countryTrafficData?.destinationData || {}).forEach(([key, data]) => {
        // If this is a No IP Info entry or a country entry, add it directly (no merging)
        mergedDestData[key] = data
      })

      // Return merged data
      return {
        countryTrafficData: {
          sourceData: mergedSourceData,
          destinationData: mergedDestData,
        },
        additionCityConnections: mergeConnections(currentMapData.additionCityConnections, newMapData.additionCityConnections),
        regionToRegionConnections: mergeConnections(currentMapData.regionToRegionConnections, newMapData.regionToRegionConnections),
        regionToCityConnections: mergeConnections(currentMapData.regionToCityConnections, newMapData.regionToCityConnections),
        cityToCityConnections: mergeConnections(currentMapData.cityToCityConnections, newMapData.cityToCityConnections),
      }
    }
    catch (error) {
      console.error('Error processing map data:', error)
      return currentMapData
    }
  }, [])

  // Fetch time settings
  useEffect(() => {
    if (!filterId) return

    const fetchTimeSettings = async () => {
      try {
        const { data: time_unit_resolution } = await refetchTimeUnitandResolution()
        const { time, resolution = '1h' } = time_unit_resolution || {}
        const { time_count = 12, time_unit = 'hour' } = time || {}

        setTimeSettings({
          time_count,
          time_unit: time_unit as 'hour',
          resolution: resolution as '1h',
        })

        // Signal that we should fetch data after time settings update
        setBatchInfo(prev => ({
          ...prev,
          is_initial_load: true,
          should_fetch: true,
          fetch_trigger: prev.fetch_trigger + 1,
          auto_fetch_active: true,
        }))
      }
      catch (error) {
        console.error('Failed to fetch time settings:', error)
      }
    }
    fetchTimeSettings().catch(error => console.error('Error in fetchTimeSettings:', error))
  }, [filterId, searchBy, refetchTimeUnitandResolution])

  // Fetch batch of data with better error handling and state management
  const fetchBatch = useCallback(async (offset = 0, reset = false) => {
    // Use ref to get current timeSettings
    const { time_count, time_unit } = timeSettingsRef.current
    const currentBatchInfo = batchInfoRef.current

    if (!time_count || !time_unit || !filterId) {
      return
    }

    // Prevent duplicate fetches
    if (currentBatchInfo.is_loading) {
      return
    }

    // Set loading state
    setBatchInfo(prev => ({
      ...prev,
      is_loading: true,
      should_fetch: false,
    }))

    try {
      // Clear existing data if this is a reset
      if (reset) {
        setMapData({
          countryTrafficData: {
            sourceData: {},
            destinationData: {},
          },
          additionCityConnections: [],
          regionToRegionConnections: [],
          regionToCityConnections: [],
          cityToCityConnections: [],
        })
        setIsMapDataReady(false)
      }

      // Get time range for query
      const timeRange = getLastTimeStamp({
        count: time_count,
        unit: time_unit as any,
        add_remaining_time: true,
      })

      // Create input object for API
      const input = {
        device_id: params?.id || '',
        time_range: timeRange,
        filter_id: filterId,
        batch_size: 10,
        batch_offset: offset,
      } as any

      // Fetch batch of IP data
      const result = await getUniqueSourceAndDestinationIP.mutateAsync(input)

      // Extract data and batch info
      const ipData = Array.isArray(result) ? result : (result.data || [])
      const batch_info = result.batch_info || {
        total_records: ipData.length + offset,
        has_more: ipData.length > 0,
        next_offset: offset + ipData.length,
      }

      // Only process if we have data
      if (ipData.length > 0) {
        // Process this batch of data
        const updatedMapData: any = await processMapData(ipData)

        // Update map data
        setMapData(updatedMapData)

        // Set map as ready after data is processed
        setIsMapDataReady(true)
      }
      else if (offset === 0) {
        // If first batch has no data, still mark as ready but with empty state
        setIsMapDataReady(true)
      }

      // Update batch info
      const newBatchInfo = {
        total_records: batch_info.total_records,
        has_more: batch_info.has_more,
        next_offset: batch_info.next_offset,
        is_loading: false,
        is_initial_load: false,
        should_fetch: false,
        fetch_trigger: currentBatchInfo.fetch_trigger,
        auto_fetch_active: currentBatchInfo.auto_fetch_active,
      }

      setBatchInfo(newBatchInfo)

      // If auto-fetch is active and there's more data, immediately fetch the next batch
      if (newBatchInfo.auto_fetch_active && newBatchInfo.has_more) {
        setTimeout(() => {
          setBatchInfo(prev => ({
            ...prev,
            should_fetch: true,
            fetch_trigger: prev.fetch_trigger + 1,
          }))
        }, 100)
      }
      else if (newBatchInfo.auto_fetch_active) {
        // Turn off auto-fetch when complete
        setBatchInfo(prev => ({
          ...prev,
          auto_fetch_active: false,
        }))
      }

      return batch_info
    }
    catch (error) {
      console.error('Failed to fetch or process batch:', error)

      // Update state even on error to prevent UI from getting stuck
      setBatchInfo(prev => ({
        ...prev,
        is_loading: false,
        is_initial_load: false,
        should_fetch: false,
        auto_fetch_active: false,
      }))

      // If we haven't loaded any data yet, set map as ready to show error state
      if (!isMapDataReady) {
        setIsMapDataReady(true)
      }
    }
  }, [filterId, params?.id, getUniqueSourceAndDestinationIP, processMapData, isMapDataReady])

  // Handle data fetching when triggered by flag
  useEffect(() => {
    const currentBatchInfo = batchInfoRef.current
    // Only fetch if explicitly told to do so and not already loading
    if (currentBatchInfo.should_fetch && !currentBatchInfo.is_loading) {
      // If auto-fetch is active and we have an offset, continue from there
      // Otherwise start from the beginning
      const offset = currentBatchInfo.auto_fetch_active && currentBatchInfo.next_offset > 0
        ? currentBatchInfo.next_offset
        : 0
      const shouldReset = currentBatchInfo.is_initial_load || offset === 0
      fetchBatch(offset, shouldReset).catch((error: Error) => {
        console.error('Error in fetchBatch:', error)
      })
    }
  }, [batchInfo.should_fetch, batchInfo.is_loading, batchInfo.is_initial_load, batchInfo.fetch_trigger, batchInfo.auto_fetch_active, fetchBatch])

  // Function to explicitly load more data
  const loadMoreData = useCallback(() => {
    const currentBatchInfo = batchInfoRef.current

    if (!currentBatchInfo.is_loading && currentBatchInfo.has_more) {
      // Enable auto-fetch mode to get all remaining data
      setBatchInfo(prev => ({
        ...prev,
        should_fetch: true,
        auto_fetch_active: true,
        fetch_trigger: prev.fetch_trigger + 1,
      }))
    }
    else {
      console.warn('No more data to load or already loading.')
    }
  }, [])

  // Function to force reset and reload all data
  const reloadAllData = useCallback(() => {
    setBatchInfo(prev => ({
      ...prev,
      is_initial_load: true,
      should_fetch: true,
      auto_fetch_active: true,
      fetch_trigger: prev.fetch_trigger + 1,
    }))
  }, [])

  // Set up event listeners
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
  return (
    <div>
      <Filter params={params} type='map_filter' />
      <Search filter_type='map_search' params={{ ...params, router: 'packet', resolver: 'filterPackets' }} />
      <h1>Traffic Flow</h1>

      {isMapDataReady
        ? (
            <div>
            {Object.keys(mapData.countryTrafficData.sourceData).length > 0
              || Object.keys(mapData.countryTrafficData.destinationData).length > 0
                ? (
                    <>
                    <MapComponent
                        // additionalCityConnections={mapData.additionCityConnections}
                        // cityToCityConnections={mapData.cityToCityConnections}
                        countryTrafficData={mapData.countryTrafficData}
                        // regionToCityConnections={mapData.regionToCityConnections}
                        // regionToRegionConnections={mapData.regionToRegionConnections}
                      />

                    <div className="mt-4 text-center">
                        {batchInfo.is_loading
                          ? (
                              <div className="flex justify-center items-center">
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                              <span>
                                  Loading data...(
                                  {Math.min(batchInfo.next_offset, batchInfo.total_records)}
                                  {' '}
                                  'of'
                                  {batchInfo.total_records || '?'}
                                  {' '}
                                  records)
                                </span>
                            </div>
                            )
                          : batchInfo.has_more
                            ? (
                                <button
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                                onClick={ loadMoreData }
                              >
                                {'Load all remaining data'}
                              </button>
                              )
                            : (
                                <div>
                                <p className='text-sm text-blue-600'>All available data loaded</p>
                                <button
                                    className='mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm'
                                    onClick={reloadAllData}
                                  >
                                    Refresh data
                                  </button>
                              </div>
                              )}

                        <p className='text-sm text-gray-500 mt-2'>
                        {'Showing '}
                        {Object.keys(mapData.countryTrafficData.sourceData).filter(k => !k.startsWith('No IP Info_')).length}
                        {' '}
                        {'source countries '}
                        {'and'}
                        {Object.keys(mapData.countryTrafficData.destinationData).filter(k => !k.startsWith('No IP Info_')).length}
                        {' '}
                        {'destination countries'}
                        {batchInfo.total_records > 0 && ` (${Math.min(batchInfo.next_offset, batchInfo.total_records)} of ${batchInfo.total_records} records)`}
                      </p>
                      </div>
                  </>
                  )
                : (
                    <div className='text-center py-8'>
                    <p className='text-lg text-gray-600'>No traffic data available for the selected filters.</p>
                    <p className='text-sm text-gray-500 mt-2'>Try adjusting your filter criteria or time range.</p>
                  </div>
                  )}
          </div>
          )
        : (
            <div className='flex justify-center items-center h-64'>
            <div className='text-center'>
                <p className='mb-2'>Loading map data...</p>
                <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto' />
              </div>
          </div>
          )}
    </div>
  )
}
