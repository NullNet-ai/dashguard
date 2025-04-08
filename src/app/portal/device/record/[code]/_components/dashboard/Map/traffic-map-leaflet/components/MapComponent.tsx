'use client'

import L, { type LatLngExpression } from 'leaflet'
import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import 'leaflet-arc'

// Function to fetch country and US state borders
const fetchCountryBorders = async () => {
  const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
  return await response.json()
}

const fetchUSStatesBorders = async () => {
  const response = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
  return await response.json()
}

// Function to get coordinates of a city
const geocodeAddress = async (address: any) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
    else {
      console.error(`Address "${address}" not found.`)
      return null
    }
  }
  catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Function to determine traffic color
const getTrafficColor = (trafficLevel: number) => {
  if (trafficLevel > 80) return 'rgba(255, 0, 0, 0.7)'
  if (trafficLevel >= 50) return 'rgba(255, 165, 0, 0.7)'
  if (trafficLevel >= 30) return 'rgba(255, 255, 0, 0.7)'
  return 'rgba(0, 128, 0, 0.7)'
}

// Function to get color for connection condition
const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'Congested': return 'rgba(255, 0, 0, 0.7)'
    case 'High Latency': return 'rgba(255, 0, 255, 0.7)'
    case 'Low Bandwidth': return 'rgba(255, 165, 0, 0.7)'
    case 'Normal': return 'rgba(255, 255, 0, 0.7)'
    case 'Stable': return 'rgba(0, 191, 255, 0.7)'
    case 'Optimized': return 'rgba(0, 128, 0, 0.7)'
    default: return 'rgba(128, 128, 128, 0.7)'
  }
}

// Default coordinates for "No IP Info" (in the sea)
const DEFAULT_SEA_COORDINATES: LatLngExpression = [0, -30]
// Function to create a **curved** traffic flow line using Bezier curves
const createCurvedFlowLine = (fromCoord: Record<string, any>, toCoord: Record<string, any>, trafficLevel: number, name: string, condition = null) => {
  if (!fromCoord && !toCoord) {
    console.error(`Missing coordinates for connection: ${name}`)
    return null
  }

  const adjustedFromCoord = fromCoord || DEFAULT_SEA_COORDINATES
  const adjustedToCoord = toCoord || DEFAULT_SEA_COORDINATES

  const curvePoints: any = []
  const segments = 50

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = adjustedFromCoord[1] * (1 - t) + adjustedToCoord[1] * t
    const y
      = adjustedFromCoord[0] * (1 - t)
        + adjustedToCoord[0] * t
        + Math.sin(Math.PI * t) * 20

    curvePoints.push([y, x])
  }

  const lineColor = condition ? getConditionColor(condition) : getTrafficColor(trafficLevel)

  return L.polyline(curvePoints, {
    color: lineColor,
    weight: Math.max(3, trafficLevel / 20),
    opacity: 0.8,
    dashArray: '5, 5',
  })
}

const MapComponent = ({ countryTrafficData, additionalCityConnections, cityToCityConnections, regionToCityConnections, regionToRegionConnections }: any) => {
  const { destinationData, sourceData } = countryTrafficData ?? {}
  // Add state to track loaded connections
  const [loadedConnections, setLoadedConnections] = useState(0)
  const [map, setMap] = useState<L.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialHighPriorityDisplayed, setInitialHighPriorityDisplayed] = useState(false)
  const cityCoordinatesCache = useRef<Record<string, any>>({})
  const priorityConnections = useRef<any[]>([])
  // Store source coordinates for reuse
  const sourceCoordinatesCache = useRef<Record<string, any>>({})
  // New function to identify high priority connections to show first
  const identifyHighPriorityConnections = () => {
    const highPriority = []

    // Add highest traffic countries (e.g., top 5)
    if (destinationData) {
      const sortedCountries = Object.entries(destinationData)
        .sort((a: any, b: any) => b[1].trafficLevel - a[1].trafficLevel)
        .slice(0, 5)

      for (const [country, data] of sortedCountries) {
        highPriority.push({
          type: 'country',
          country,
          city: (data as any).city,
          trafficLevel: (data as any).trafficLevel,
          destination_ip: (data as any).destination_ip,
          source_location: sourceData?.[country]?.location || 'Sea Point',
          source_ip: sourceData?.[country]?.source_ip,
        })
      }
    }

    // Add highest traffic additional cities (e.g., top 3)
    if (additionalCityConnections && additionalCityConnections.length > 0) {
      const sortedCities = [...additionalCityConnections]
        .sort((a, b) => b.trafficLevel - a.trafficLevel)
        .slice(0, 3)

      for (const cityData of sortedCities) {
        highPriority.push({
          type: 'additionalCity',
          city: cityData.city,
          trafficLevel: cityData.trafficLevel,
          source_location: sourceData?.[cityData.city]?.location || 'Sea Point',
          source_ip: sourceData?.[cityData.city]?.source_ip,
        })
      }
    }

    return highPriority
  }

  useEffect(() => {
    // Identify high priority connections before map initialization
    priorityConnections.current = identifyHighPriorityConnections()
  }, [destinationData, additionalCityConnections, sourceData])

  // Get a sea point based on destination coordinates
  const getSeaPoint = (destinationCoords: Record<string, any>) => {
    // Get a point in the ocean roughly in the direction of the destination
    // This is a simplified approach - calculate a point 20 degrees west of destination
    return [
      destinationCoords[0] - (Math.random() * 5 - 2.5),
      destinationCoords[1] - 20,
    ]
  }

  // Get source coordinates (either from sourceData or generate sea point)
  const getSourceCoordinates = async (destinationName: any, destinationCoords: Record<string, any>) => {
    // If we have source data for this destination
    if (sourceData?.[destinationName]?.location) {
      const locationName = sourceData[destinationName].location

      // Check if we already cached these coordinates
      if (sourceCoordinatesCache.current[locationName]) {
        return sourceCoordinatesCache.current[locationName]
      }

      // Otherwise geocode and cache
      const coords = await geocodeAddress(locationName)
      if (coords) {
        sourceCoordinatesCache.current[locationName] = coords
        return coords
      }
    }

    // If no source data or geocoding failed, return a sea point
    return getSeaPoint(destinationCoords)
  }

  useEffect(() => {
    const initializeMap = async () => {
      // Create map instance
      const mapInstance = L.map('map', {
        center: [14.5995, 120.9842],
        zoom: 3,
        minZoom: 3,
        maxZoom: 8,
        worldCopyJump: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1.0,
      })

      // Add base tile layer
      L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stamen.com/">Stamen Maps</a>',
        maxZoom: 20,
      }).addTo(mapInstance)

      // Store map instance in state
      setMap(mapInstance)

      // Fetch borders
      const [countries, states] = await Promise.all([fetchCountryBorders(), fetchUSStatesBorders()])
      const geojson = { ...countries, features: [...countries.features, ...states.features] }

      // Add GeoJSON layer for countries
      L.geoJSON(geojson, {
        style: (feature) => {
          const countryName = feature?.properties.name
          const trafficLevel = destinationData[countryName]?.trafficLevel

          return {
            fillColor: trafficLevel ? getTrafficColor(trafficLevel) : 'transparent',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: trafficLevel ? 0.4 : 0.1,
          }
        },
        onEachFeature: (feature, layer) => {
          const countryName = feature.properties.name
          const trafficLevel = destinationData[countryName]?.trafficLevel
          const destination_ip = destinationData[countryName]?.destination_ip

          if (trafficLevel) {
            // Add country label
            const center = (layer as any)?.getBounds().getCenter()
            const label = L.divIcon({
              className: 'country-label',
              html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .8em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${countryName.toUpperCase()}</div>`,
            })
            L.marker(center, { icon: label }).addTo(mapInstance)

            // Add tooltip to the region
            layer.bindTooltip(
              `<div style="text-align: center;">
                <strong>${countryName}</strong><br/>
                Traffic Level: ${trafficLevel}%<br/>
                Destination IP: ${destination_ip}
              </div>`, {
                permanent: false,
                direction: 'auto',
                className: 'custom-tooltip',
              }
            )
          }
        },
      }).addTo(mapInstance)

      // Set loading complete
      setIsLoading(false)

      // Display high priority connections immediately
      displayHighPriorityConnections(mapInstance).catch((error) => {
        console.error('Error displaying high priority connections:', error)
      })
    }

    initializeMap().catch((error) => {
      console.error('Error initializing map:', error)
    })

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [destinationData, sourceData])

  // Create source marker based on source data
  const createSourceMarker = (
    mapInstance: L.Map,
    coordinates: LatLngExpression,
    locationName: string,
    source_ip: string | null = null
  ) => {
    const adjustedCoordinates = coordinates || DEFAULT_SEA_COORDINATES

    // Determine if this is a sea point or an actual location
    const isSeaPoint = locationName === 'Sea Point'

    // Create the source dot with appropriate styling
    const dotColor = isSeaPoint ? '#00BFFF' : '#0000FF'
    const divIcon = L.divIcon({
      className: isSeaPoint ? 'sea-source-dot' : 'source-dot',
      html: `<div class="dot ${!isSeaPoint ? 'pulse-animation' : ''}" style="background:${dotColor}; width:${isSeaPoint ? '10px' : '14px'}; height:${isSeaPoint ? '10px' : '14px'};"></div>`,
      iconSize: [isSeaPoint ? 10 : 14, isSeaPoint ? 10 : 14],
      iconAnchor: [isSeaPoint ? 5 : 7, isSeaPoint ? 5 : 7],
    })

    const marker = L.marker(adjustedCoordinates, { icon: divIcon }).addTo(mapInstance)

    // Only add labels and circles for non-sea points
    if (!isSeaPoint) {
      // Add source label
      const safeLocationName: any = locationName ?? 'Unknown Location'
      const sourceLabelName = safeLocationName?.split(',')[0].toUpperCase()
      const sourceLabelIcon = L.divIcon({
        className: 'city-label',
        html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .7em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${sourceLabelName}</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, -15],
      })
      L.marker(adjustedCoordinates, { icon: sourceLabelIcon }).addTo(mapInstance)

      // Add a highlighted circle for the source
      L.circle(adjustedCoordinates, {
        color: dotColor,
        fillColor: dotColor,
        fillOpacity: 0.2,
        radius: 150000,
        weight: 2,
      }).addTo(mapInstance)

      // Add tooltip
      const tooltipContent = source_ip
        ? `<div style="text-align: center;"><strong>${locationName}</strong><br/>Source IP: ${source_ip}</div>`
        : `<div style="text-align: center;"><strong>${locationName}</strong><br/>Traffic Source</div>`

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      })
    }
    else if (source_ip) {
      // For sea points, only add tooltip if we have source IP
      marker.bindTooltip(
        `<div style="text-align: center;"><strong>Traffic Source</strong><br/>Source IP: ${source_ip}</div>`, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip',
        }
      )
    }

    return marker
  }

  // Function to create a city marker with circle and label
  const createCityMarker = (mapInstance: L.Map, coordinates: LatLngExpression, name: string, trafficLevel: number, cityName = null, destination_ip: string) => {
    const adjustedCoordinates = coordinates || DEFAULT_SEA_COORDINATES

    if (!adjustedCoordinates) {
      console.error(`Missing coordinates for city/region: ${cityName || name}`)
      return null
    }

    // Create the twinkling dot
    const dotColor = getTrafficColor(trafficLevel)
    const divIcon = L.divIcon({
      className: 'twinkling-dot',
      html: `<div class="dot" style="background:${dotColor};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    const marker = L.marker(adjustedCoordinates, { icon: divIcon }).addTo(mapInstance)

    // Add colored circle around the dot
    // const circle = L.circle(adjustedCoordinates, {
    //   color: dotColor,
    //   fillColor: dotColor,
    //   fillOpacity: 0.2,
    //   radius: 100000,
    //   weight: 1,
    // }).addTo(mapInstance)

    // Add city label - with black color and all uppercase
    const displayCityName: any = cityName || name
    const cityLabel = displayCityName?.split(',')[0].toUpperCase()

    const cityLabelIcon = L.divIcon({
      className: 'city-label',
      html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .7em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${cityLabel}</div>`,
      iconSize: [80, 20],
      iconAnchor: [40, -10],
    })
    L.marker(adjustedCoordinates, { icon: cityLabelIcon }).addTo(mapInstance)

    // Add tooltip to the marker
    marker.bindTooltip(
      `<div style="text-align: center;">
        <strong>${cityName || name}</strong><br/>
        Traffic Level: ${trafficLevel}%<br/>
        Destination IP: ${destination_ip || 'N/A'}
      </div>`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      }
    )

    return marker
  }

  // Function to display high priority connections immediately
  const displayHighPriorityConnections = async (mapInstance: L.Map) => {
    if (initialHighPriorityDisplayed) return

    for (const connection of priorityConnections.current) {
      try {
        let destinationCoordinates

        if (connection.type === 'country') {
          // Get coordinates for the country's main city
          if (!cityCoordinatesCache.current[connection.city]) {
            cityCoordinatesCache.current[connection.city] = await geocodeAddress(connection.city)
          }
          destinationCoordinates = cityCoordinatesCache.current[connection.city]

          if (destinationCoordinates) {
            // Get source coordinates
            const sourceCoordinates = await getSourceCoordinates(connection.country, destinationCoordinates)

            // Create source marker
            createSourceMarker(mapInstance, sourceCoordinates, connection.source_location, connection.source_ip)

            // Create destination city marker
            createCityMarker(mapInstance, destinationCoordinates, connection.country, connection.trafficLevel, connection.city, connection.destination_ip)

            // Create curved flow line
            const curvedLine = createCurvedFlowLine(
              sourceCoordinates, destinationCoordinates, connection.trafficLevel, connection.city
            )

            if (curvedLine) {
              curvedLine.bindTooltip(
                `<div style="text-align: center;">
                  <strong>${connection.source_location || 'Traffic Source'} → ${connection.city}</strong><br/>
                  Traffic Level: ${connection.trafficLevel}%<br/>
                  ${connection.source_ip ? `Source IP: ${connection.source_ip}<br/>` : ''}
                  ${connection.destination_ip ? `Destination IP: ${connection.destination_ip}` : ''}
                </div>`, {
                  permanent: false,
                  direction: 'center',
                  className: 'custom-tooltip',
                }
              )

              curvedLine.getElement()?.classList.add('connection-fadeIn')
              curvedLine.addTo(mapInstance)
            }
          }
        }
        else if (connection.type === 'additionalCity') {
          // Get coordinates for additional city
          if (!cityCoordinatesCache.current[connection.city]) {
            cityCoordinatesCache.current[connection.city] = await geocodeAddress(connection.city)
          }
          destinationCoordinates = cityCoordinatesCache.current[connection.city]

          if (destinationCoordinates) {
            // Get source coordinates
            const sourceCoordinates = await getSourceCoordinates(connection.city, destinationCoordinates)

            // Create source marker
            createSourceMarker(mapInstance, sourceCoordinates, connection.source_location, connection.source_ip)

            // Create destination city marker
            createCityMarker(mapInstance, destinationCoordinates, connection.city, connection.trafficLevel, connection.city, connection.destination_ip)

            // Create curved flow line
            const curvedLine = createCurvedFlowLine(
              sourceCoordinates, destinationCoordinates, connection.trafficLevel, connection.city
            )

            if (curvedLine) {
              curvedLine.bindTooltip(
                `<div style="text-align: center;">
                  <strong>${connection.source_location || 'Traffic Source'} → ${connection.city}</strong><br/>
                  Traffic Level: ${connection.trafficLevel}%<br/>
                  ${connection.source_ip ? `Source IP: ${connection.source_ip}<br/>` : ''}
                  ${connection.destination_ip ? `Destination IP: ${connection.destination_ip}` : ''}
                </div>`, {
                  permanent: false,
                  direction: 'center',
                  className: 'custom-tooltip',
                }
              )

              curvedLine.getElement()?.classList.add('connection-fadeIn')
              curvedLine.addTo(mapInstance)
            }
          }
        }
      }
      catch (error) {
        console.error(`Error displaying high priority connection: ${error}`)
      }
    }

    setInitialHighPriorityDisplayed(true)
  }

  // Effect to handle staged loading of connections
  useEffect(() => {
    if (!map || isLoading) return

    const loadNextBatchOfConnections = async () => {
      // Prepare all connections for staged loading
      const allConnections: any[] = []

      // 1. Get coordinates for countries in trafficData
      const cityCoordinates: any = { ...cityCoordinatesCache.current }
      const countryCoordinates: any = {}

      // Pre-fetch all coordinates first
      for (const country in destinationData) {
        if (!cityCoordinates[destinationData[country].city]) {
          cityCoordinates[destinationData[country].city] = await geocodeAddress(destinationData[country].city)
          cityCoordinatesCache.current[destinationData[country].city] = cityCoordinates[destinationData[country].city]
        }
        countryCoordinates[country] = await geocodeAddress(country)
      }

      // Get coordinates for additional cities
      const additionalCityCoordinates: any = { ...cityCoordinatesCache.current }
      for (const cityData of additionalCityConnections) {
        if (!additionalCityCoordinates[cityData.city]) {
          additionalCityCoordinates[cityData.city] = await geocodeAddress(cityData.city)
          cityCoordinatesCache.current[cityData.city] = additionalCityCoordinates[cityData.city]
        }
      }

      // Get coordinates for regions
      const regionCoordinates: any = {}
      for (const regionData of regionToRegionConnections) {
        if (!regionCoordinates[regionData.toRegion]) {
          const coords = await geocodeAddress(regionData.toRegion)
          if (coords) {
            regionCoordinates[regionData.toRegion] = coords
          }
        }
      }

      // 2. Prepare Country Traffic Data connections
      for (const country in destinationData) {
        const { trafficLevel, city, destination_ip } = destinationData[country]
        const destinationCoordinates = cityCoordinates[city]

        // Skip high priority connections that were already displayed
        const isHighPriority = priorityConnections.current.some(conn => conn.type === 'country' && conn.country === country
        )

        if (destinationCoordinates && !isHighPriority) {
          // Get source coordinates for this country
          const sourceCoordinates = await getSourceCoordinates(country, destinationCoordinates)

          allConnections.push({
            type: 'country',
            fromCoord: sourceCoordinates,
            toCoord: destinationCoordinates,
            name: city,
            displayName: `${sourceData?.[country]?.location || 'Traffic Source'} → ${city}`,
            trafficLevel,
            destination_ip,
            source_ip: sourceData?.[country]?.source_ip,
            sourceName: sourceData?.[country]?.location || 'Sea Point',
            condition: null,
            callbacks: [
              // Create source marker
              () => createSourceMarker(map, sourceCoordinates, sourceData?.[country]?.location || 'Sea Point', sourceData?.[country]?.source_ip),
              // Create destination marker
              () => createCityMarker(map, destinationCoordinates, country, trafficLevel, city, destination_ip),
            ],
          })
        }
      }

      // 3. Prepare Additional City connections
      additionalCityConnections.forEach((cityData: Record<string, any>) => {
        const { city, trafficLevel } = cityData
        const destinationCoordinates = additionalCityCoordinates[city]

        // Skip high priority connections that were already displayed
        const isHighPriority = priorityConnections.current.some(conn => conn.type === 'additionalCity' && conn.city === city
        )

        if (destinationCoordinates && !isHighPriority) {
          // Use source data if available
          const getSourceCoordAndCreateConnection = async () => {
            // Get source coordinates
            const sourceCoordinates = await getSourceCoordinates(city, destinationCoordinates)

            allConnections.push({
              type: 'additionalCity',
              fromCoord: sourceCoordinates,
              toCoord: destinationCoordinates,
              name: city,
              displayName: `${sourceData?.[city]?.location || 'Traffic Source'} → ${city}`,
              trafficLevel,
              destination_ip: destinationData[city]?.destination_ip,
              source_ip: sourceData?.[city]?.source_ip,
              sourceName: sourceData?.[city]?.location || 'Sea Point',
              condition: null,
              callbacks: [
                // Create source marker
                () => createSourceMarker(map, sourceCoordinates, sourceData?.[city]?.location || 'Sea Point', sourceData?.[city]?.source_ip),
                // Create destination marker
                () => createCityMarker(map, destinationCoordinates, city, trafficLevel, city, destinationData[city]?.destination_ip),
              ],
            })
          }

          // Add async function to execution queue
          void getSourceCoordAndCreateConnection()
        }
      })

      // 4. Prepare Region-to-Region connections
      regionToRegionConnections.forEach((connection: Record<string, any>) => {
        const { toRegion, trafficLevel, condition } = connection as Record<string, any>
        const destinationCoordinates = regionCoordinates[toRegion]

        if (destinationCoordinates) {
          // Use source data if available or create sea point
          const getSourceCoordAndCreateConnection = async () => {
            // Get source coordinates
            const sourceCoordinates = await getSourceCoordinates(toRegion, destinationCoordinates)

            allConnections.push({
              type: 'regionToRegion',
              fromCoord: sourceCoordinates,
              toCoord: destinationCoordinates,
              name: `Traffic Source to ${toRegion}`,
              displayName: `${sourceData?.[toRegion]?.location || 'Traffic Source'} → ${toRegion}`,
              trafficLevel,
              destination_ip: destinationData[toRegion]?.destination_ip,
              source_ip: sourceData?.[toRegion]?.source_ip,
              sourceName: sourceData?.[toRegion]?.location || 'Sea Point',
              condition,
              callbacks: [
                // Create source marker
                () => createSourceMarker(map, sourceCoordinates, sourceData?.[toRegion]?.location || 'Sea Point', sourceData?.[toRegion]?.source_ip),
                // Create destination marker
                () => createCityMarker(map, destinationCoordinates, toRegion, trafficLevel, toRegion, destinationData[toRegion]?.destination_ip),
              ],
            })
          }

          // Add async function to execution queue
          void getSourceCoordAndCreateConnection()
        }
      })

      // 5. Prepare Region-to-City connections
      regionToCityConnections.forEach((connection: Record<string, any>) => {
        const { fromRegion, toCity, trafficLevel, condition } = connection as Record<string, any>
        const fromCoordinates = countryCoordinates[fromRegion]
        const toCityCoordinates = additionalCityCoordinates[toCity]

        if (fromCoordinates && toCityCoordinates) {
          allConnections.push({
            type: 'regionToCity',
            fromCoord: fromCoordinates,
            toCoord: toCityCoordinates,
            name: `${fromRegion} to ${toCity}`,
            displayName: `${fromRegion} → ${toCity}`,
            trafficLevel,
            destination_ip: destinationData[toCity]?.destination_ip,
            source_ip: sourceData?.[fromRegion]?.source_ip,
            condition,
            callbacks: [],
          })
        }
      })

      // 6. Prepare City-to-City connections
      cityToCityConnections.forEach((connection: Record<string, any>) => {
        const { fromCity, toCity, trafficLevel, condition } = connection as Record<string, any>
        const fromCityCoordinates = additionalCityCoordinates[fromCity]
        const toCityCoordinates = additionalCityCoordinates[toCity]

        if (fromCityCoordinates && toCityCoordinates) {
          allConnections.push({
            type: 'cityToCity',
            fromCoord: fromCityCoordinates,
            toCoord: toCityCoordinates,
            name: `${fromCity} to ${toCity}`,
            displayName: `${fromCity} → ${toCity}`,
            trafficLevel,
            destination_ip: destinationData[toCity]?.destination_ip,
            source_ip: sourceData?.[fromCity]?.source_ip,
            condition,
            callbacks: [],
          })
        }
      })

      // Staged loading of connections, 10 at a time
      const batchSize = 10
      const totalConnections = allConnections.length
      const currentLoadedIndex = loadedConnections

      // Calculate the end index for this batch
      const endIndex = Math.min(currentLoadedIndex + batchSize, totalConnections)

      // Load the next batch of connections
      for (let i = currentLoadedIndex; i < endIndex; i++) {
        const connection = allConnections[i]

        // Execute callbacks to create markers if provided
        if (connection.callbacks && connection.callbacks.length > 0) {
          connection.callbacks.forEach((callback: () => void) => {
            if (typeof callback === 'function') callback()
          })
        }

        // Create and add curved line
        const curvedLine = createCurvedFlowLine(
          connection.fromCoord, connection.toCoord, connection.trafficLevel, connection.name, connection.condition
        )

        if (curvedLine) {
          const tooltipContent = `<div style="text-align: center;">
            <strong>${connection.displayName}</strong><br/>
            Traffic Level: ${connection.trafficLevel}%<br/>
            ${connection.source_ip ? `Source IP: ${connection.source_ip}<br/>` : ''}
            ${connection.destination_ip ? `Destination IP: ${connection.destination_ip}<br/>` : ''}
            ${connection.condition ? `Condition: ${connection.condition}` : ''}
          </div>`

          curvedLine.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip',
          })

          // Add animation class to make it appear with a fade-in effect
          curvedLine.getElement()?.classList.add('connection-fadeIn')
          curvedLine.addTo(map)
        }
      }

      // Update loaded connection count
      setLoadedConnections(endIndex)

      // If there are more connections to load, schedule the next batch
      if (endIndex < totalConnections) {
        setTimeout(() => {
          // We'll call this same function again after a delay
          void loadNextBatchOfConnections()
        }, 1000)
      }
      else {
        // All connections loaded, add the legend
        addLegend()
      }
    }

    // Add legend to the map
    const addLegend = () => {
      const legend = (L as any).control({ position: 'bottomright' })
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend')
        div.innerHTML = `
          <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);">
            <strong>Traffic Level</strong><br>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 0, 0, 0.7); border-radius:50%;"></span> Very High (>80%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 165, 0, 0.7); border-radius:50%;"></span> High (50-80%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 255, 0, 0.7); border-radius:50%;"></span> Medium (30-50%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(0, 128, 0, 0.7); border-radius:50%;"></span> Low (<30%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:#0000FF; border-radius:50%;"></span> Source Location</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:#00BFFF; border-radius:50%;"></span> Sea Source Point</div>
            
            <strong style="margin-top: 10px; display: block;">Connection Conditions</strong>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 0, 0, 0.7);"></span> Congested</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 0, 255, 0.7);"></span> High Latency</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 165, 0, 0.7);"></span> Low Bandwidth</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 255, 0, 0.7);"></span> Normal</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(0, 191, 255, 0.7);"></span> Stable</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(0, 128, 0, 0.7);"></span> Optimize</div>
        `
        return div
      }
      legend.addTo(map)
    }

    // Start the loading process for the first time if high priority connections are already displayed
    if (initialHighPriorityDisplayed && loadedConnections === 0) {
      void loadNextBatchOfConnections()
    }
  }, [map, isLoading, loadedConnections, destinationData, additionalCityConnections, cityToCityConnections, regionToCityConnections, regionToRegionConnections, initialHighPriorityDisplayed])

  // Loading indicator - change based on loaded connections
  const getLoadingStatus = () => {
    if (isLoading) {
      return 'Initializing map...'
    }

    // Show initial high-priority loading status
    if (!initialHighPriorityDisplayed) {
      return 'Loading high priority connections...'
    }

    // Calculate total connections (approximate since we don't fetch yet)
    const highPriorityCount = priorityConnections.current.length
    const totalConnections = (
      (destinationData ? Object.keys(destinationData).length : 0)
      + (additionalCityConnections ? additionalCityConnections.length : 0)
      + (regionToRegionConnections ? regionToRegionConnections.length : 0)
      + (regionToCityConnections ? regionToCityConnections.length : 0)
      + (cityToCityConnections ? cityToCityConnections.length : 0)
      - highPriorityCount
    )

    if (loadedConnections >= totalConnections) {
      return null
    }

    return `Loading additional connections: ${loadedConnections}/${totalConnections}`
  }

  const loadingStatus = getLoadingStatus()

  return (
    <>
      <style>
        {`
          /* Twinkling Dot Animation */
          @keyframes twinkle {
            0% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.3; transform: scale(1); }
          }
          
          /* Pulse Animation for Philippines dot */
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(0, 0, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 0, 255, 0); }
          }

          .twinkling-dot .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            position: absolute;
            animation: twinkle 1.5s infinite ease-in-out;
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          /* Connection Fade-in Animation */
          @keyframes connectionFadeIn {
            from { opacity: 0; }
            to { opacity: 0.8; }
          }
          
          .connection-fadeIn {
            animation: connectionFadeIn 1s ease-in-out;
          }

          /* Custom Tooltip Styles */
          .custom-tooltip {
            background-color: rgba(255, 255, 255, 0.9);
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px;
            font-family: geist, sans-serif;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          /* City Label Styles */
          .city-label {
            pointer-events: none;
            z-index: 450;
          }
          
          /* Loading overlay */
          .loading-overlay {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: geist, sans-serif;
            font-size: 14px;
            transition: opacity 0.5s ease-in-out;
          }
        `}
      </style>
      <div id="map" style={{ height: '100vh', width: '100%' }} />

      {loadingStatus
      && (
        <div className="loading-overlay">
          {loadingStatus}
        </div>
      )}
    </>
  )
}

export default MapComponent
