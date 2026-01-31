'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getFlagDetails } from '~/app/api/device/get_flags'
import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import MapComponent from './components/MapComponent'
import { useSocketConnection } from '../../custom-hooks/useSocketConnection'
import Filter from '../../timeline/Filter'
import { Card, CardHeader, CardTitle } from '~/components/ui/card'

/**
 * Formats IP data with country information, handling cases where country info is missing
 * @param {Array} ipData - Array of IP data objects containing source and destination IPs
 * @returns {Object} Formatted data with country mappings and connection information
 */
  
// Function to update countryTrafficData dynamically
const updateCountryTrafficData = (prevData = [], newData: any) => {
  if (!newData) return prevData;

  // Clone the previous data to avoid mutating the original array
  let updatedData: any = [...prevData];

  // Check if the new data matches any existing entry (based on `source_ip` and `destination_ip`)
  const existingIndex = updatedData.findIndex(
    (item: any) =>
      item.source_ip === newData.source_ip &&
      item.destination_ip === newData.destination_ip
  );

  if (existingIndex !== -1) {
    // If a match is found, update the existing entry
    updatedData[existingIndex] = {
      ...updatedData[existingIndex],
      total_byte: updatedData[existingIndex].total_byte + newData.total_byte, // Increment `total_byte`
    };
  } else {
    // If no match is found, add the new data to the beginning of the array
    updatedData.unshift(newData);

    // If the array exceeds 10 entries, remove the oldest entry
    if (updatedData.length > 10) {
      updatedData.pop();
    }
  }

  return updatedData;
};
export function formatIpCountryConnections(ipData = []) {
  // Initialize data structures
  const formattedData: Record<string,any> = {
    countryMap: {
      sourceData: {},
      destinationData: {},
    },
    connections: {
      countryToCountry: [],
      ipToIp: [],
      unknownConnections: [],
    },
  }

  // Process each IP entry
  ipData.forEach((entry: Record<string, any>) => {
    if (!entry) return;
    
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
  const mapReadyData: Record<string, any> = {
    countryTrafficData: {
      sourceData: {},
      destinationData: {},
    },
    additionCityConnections: [],
    regionToRegionConnections: [],
    regionToCityConnections: [],
    cityToCityConnections: [],
  }

  // Process source country data
  Object.entries(formattedData.countryMap.sourceData).forEach(([key, data]: any) => {
    if (key.startsWith('No IP Info_')) {
      // For unknown country, create individual entries for each IP
      const ipAddress = data?.ip
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

export default function TrafficMaps({ params, defaultValues }: Record<string, any>) {
  const eventEmitter = useEventEmitter()
  const [filterId, setFilterID] = useState('01JNQ9WPA2JWNTC27YCTCYC1FE')
  const [searchBy, setSearchBy] = useState()
  const [mapData, setMapData] = useState({
    countryTrafficData: {
      ipData: []
    },
    additionCityConnections: [],
    regionToRegionConnections: [],
    regionToCityConnections: [],
    cityToCityConnections: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeSettings, setTimeSettings] = useState<Record<string, any>>({
    time_count: 1,
    time_unit: 'hour',
    resolution: '1h',
  })

  const [token, setToken] = useState<string | null>(null)
  const [org_acc_id, setOrgAccountID] = useState<string | null>(null)
  const channel_name = 'live_map'
  const {socket} = useSocketConnection({channel_name, token})
  const getAccount = api.organizationAccount.getAccountID.useMutation()
  const taskQueueRef = useRef<Array<() => Promise<void>>>([])
  const isQueueWorkerRunningRef = useRef(false)
  const isUnmountedRef = useRef(false)
  const startQueueServiceRef = useRef<(() => void) | null>(null)
  
  // API hooks
  const getUniqueSourceAndDestinationIP = api.packet.getUniqueSourceAndDestinationIP.useMutation()
  const { refetch: refetchTimeUnitandResolution } = api.cachedFilter.fetchCachedFilterTimeUnitandResolution.useQuery(
    {
      type: 'map_filter',
      filter_id: filterId,
    }, {
      enabled: false,
    }
  )

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
            console.error('[traffic-map] queue task failed', err)
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
    startQueueServiceRef.current = startQueueService
  }, [startQueueService])

  const enqueueTask = useCallback((task: () => Promise<void>) => {
    taskQueueRef.current.push(task)
    startQueueServiceRef.current?.()
  }, [])
  const fetchInitialDataRef = useRef<((isInitial: boolean) => Promise<void>) | null>(null)
  const isFirstReloadRef = useRef(true)
  
  useEffect(() => {
    isFirstReloadRef.current = true
  }, [filterId, params?.id, searchBy])

  const reloadData = useCallback(() => {
    enqueueTask(() => {
      if (!fetchInitialDataRef.current) return Promise.resolve()
      const isInitial = isFirstReloadRef.current
      isFirstReloadRef.current = false
      return fetchInitialDataRef.current(isInitial)
    })
  }, [enqueueTask])

  // Process and enhance IP data with country flags
  const processIPData = useCallback(async (ipData: Record<string, any>) => {
    try {
      // Get country details for the entry
      const updatedData = { ...ipData };
      
      // Process source country flag
      if (ipData.source_country) {
        const sourceFlagDetails = await getFlagDetails(ipData.source_country?.country);
        if (sourceFlagDetails?.name) {
          updatedData.source_country = {
            country: sourceFlagDetails.name,
          };
        }
      }
      
      // Process destination country flag
      if (ipData.destination_country) {
        const destFlagDetails = await getFlagDetails(ipData.destination_country?.country);
        if (destFlagDetails?.name) {
          updatedData.destination_country = {
            country: destFlagDetails.name,
          };
        }
      }
      
      return updatedData;
    } catch (error) {
      console.error('Error processing IP data:', error);
      return ipData;
    }
  }, []);
  
  // Fetch organization account info
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await getAccount.mutateAsync();
        const { organization_id, token } = res || {};
        setOrgAccountID(organization_id || null);
        setToken(token);
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    };
    
    fetchAccount();
  }, [
    // getAccount
  ]);

  // Fetch time settings
  useEffect(() => {
    if (!filterId) return;

    const fetchTimeSettings = async () => {
      try {
        const { data: time_unit_resolution } = await refetchTimeUnitandResolution();
        const { time, resolution = '1h' } = time_unit_resolution || {};
        const { time_count = 1, time_unit = 'hour' } = time || {};

        setTimeSettings({
          time_count,
          time_unit,
          resolution,
        });
        
        // After time settings are updated, fetch initial data
        reloadData();
      } catch (error) {
        console.error('Failed to fetch time settings:', error);
      }
    };
    
    fetchTimeSettings();
  }, [filterId, searchBy, refetchTimeUnitandResolution, reloadData]);

  // Fetch initial data (just one record for initial display)
  const fetchInitialData = useCallback(async (isInitial: boolean) => {
    console.debug(`[pooling] - fetchInitialData`)
    setIsLoading(true);
    
    try {
      const timeRange = isInitial ? getLastTimeStamp({
          count: 1,
          unit: 'day',
          add_remaining_time: true,
        }) : getLastTimeStamp({
        count: 2,  // timeSettings.time_count,
        unit: 'second', // timeSettings.time_unit,
        add_remaining_time: true,
      });
      
      const input: any = {
        device_id: params?.id || '',
        time_range: timeRange,
        filter_id: filterId,
        // batch_size: isInitial ? 1 : 100, // Just fetch one record for initial display
        // batch_offset: 0,
        address: defaultValues?.address
      };
      
      const result = await getUniqueSourceAndDestinationIP.mutateAsync(input);
      const ipData = Array.isArray(result) ? result : (result.data || []);
      
      if (ipData.length > 0) {
        // Process the IP data
        let processedDatas = []
          processedDatas = await Promise.all(ipData.map(async (ip) => await processIPData(ip)))
        
        // Update map data with the processed data
        setMapData((prev: any) => {
          return ({
          ...prev,
          countryTrafficData: {
            ipData: processedDatas // .filter(e => e.source_country.country !== 'No IP Info')
          }
        })});
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterId, params?.id, getUniqueSourceAndDestinationIP, timeSettings, processIPData]);
  
  useEffect(() => {
    fetchInitialDataRef.current = fetchInitialData
  }, [fetchInitialData])

  // Listen for socket updates
  useEffect(() => {
    console.debug(`[socket] event - ${channel_name} listener isnt created yet`)
    if (!socket || !org_acc_id || filterId !== '01JNQ9WPA2JWNTC27YCTCYC1FE') return;
    const eventKey = `${channel_name}-${params?.id}-${org_acc_id}`;
    
    console.debug(`[socket] event - ${eventKey} listener created`)
    socket.on(eventKey, async (data: any) => {
      console.debug(`[socket] event ${eventKey} - data`, data)
      // Format the incoming data
      const formattedData = {
        id: data.id,
        source_ip: data.source_ip,
        destination_ip: data.destination_ip,
        interface_name: data.interface_name,
        total_byte: data.total_byte,
        timestamp: data.timestamp,
        organization_id: data.organization_id,
        created_by: data.created_by,
        source_country: data.ip_info?.source?.country,
        destination_country: data.ip_info?.destination?.country,
        source_coordinates: data.source_coordinates,
        destination_coordinates: data.destination_coordinates
      };
      
      // Process the IP data with country flags
      const processedData = await processIPData(formattedData);
      
      // Update the map data with the processed socket data
      setMapData((prev: any) => {
        return ({
        ...prev,
        countryTrafficData: {
          ipData: updateCountryTrafficData(prev?.countryTrafficData?.ipData, processedData)
        },
      })});
    });
  
    // Cleanup function
    return () => {
      socket.off(eventKey);
    };
  }, [socket, org_acc_id, filterId, params?.id, processIPData]);

  // Set up event listeners for filter changes
  useEffect(() => {
    if (!eventEmitter) return;

    const setFID = (data: any) => {
      if (typeof data !== 'string') return;
      setFilterID(data);
    };

    const setSBy = (data: any) => {
      setSearchBy(data);
    };

    eventEmitter.on(`timeline_filter_id`, setFID);
    eventEmitter.on('timeline_search', setSBy);

    return () => {
      eventEmitter.off(`timeline_filter_id`, setFID);
      eventEmitter.off(`timeline_search`, setSBy);
    };
  }, [eventEmitter]);

  useEffect(() => {
    isUnmountedRef.current = false
    taskQueueRef.current = []

    const twelveHoursMs = 2000 // 12 * 60 * 60 * 1000
    const interval = window.setInterval(() => {
      reloadData()
    }, twelveHoursMs)

    return () => {
      window.clearInterval(interval)
      isUnmountedRef.current = true
      taskQueueRef.current = []
    }
  }, [reloadData])

  useEffect(() => {
    if (!filterId) return

    eventEmitter.emit('timeline_filter_id_active_label', filterId)
  }, [filterId])

  return (
    <Card className='overflow-hidden'>
      {/* <Filter params={params} type='map_filter' /> */}
      {/* <Search filter_type='map_search' params={{ ...params, router: 'packet', resolver: 'filterPackets' }} /> */}
      <CardHeader className={"flex flex-row items-center justify-between bg-slate-100"}>
        <CardTitle className="text-md text-foreground">
          Traffic Flow
        </CardTitle>
      </CardHeader>

      {false ? (// isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='text-center'>
            <p className='mb-2'>Loading map data...</p>
            <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto' />
          </div>
        </div>
      ) : (
        <div className='relative z-[1] overflow-hidden'>
          { (
            <>
              <MapComponent
                countryTrafficData={defaultValues.is_device_online ? mapData.countryTrafficData : { ipData: [] }}
                filterId={filterId}
              />
            </>
          )}
        </div>
      )}
    </Card>
  )
}