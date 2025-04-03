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
  if (trafficLevel > 80) return 'rgba(255, 0, 0, 0.7)' // 🔴 Very High
  if (trafficLevel >= 50) return 'rgba(255, 165, 0, 0.7)' // 🟠 High
  if (trafficLevel >= 30) return 'rgba(255, 255, 0, 0.7)' // 🟡 Medium
  return 'rgba(0, 128, 0, 0.7)' // 🟢 Low
}

// Function to get color for connection condition
const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'Congested': return 'rgba(255, 0, 0, 0.7)' // Red
    case 'High Latency': return 'rgba(255, 0, 255, 0.7)' // Purple
    case 'Low Bandwidth': return 'rgba(255, 165, 0, 0.7)' // Orange
    case 'Normal': return 'rgba(255, 255, 0, 0.7)' // Yellow
    case 'Stable': return 'rgba(0, 191, 255, 0.7)' // Light Blue
    case 'Optimized': return 'rgba(0, 128, 0, 0.7)' // Green
    default: return 'rgba(128, 128, 128, 0.7)' // Gray
  }
}

// Function to create a **curved** traffic flow line using Bezier curves
const createCurvedFlowLine = (fromCoord: Record<string, any>, toCoord: Record<string, any>, trafficLevel: number, name: string, condition = null) => {
  if (!fromCoord || !toCoord) {
    console.error(`Missing coordinates for connection: ${name}`)
    return null
  }

  const curvePoints: any = []
  const segments = 50 // Higher = smoother curve

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = fromCoord[1] * (1 - t) + toCoord[1] * t
    const y
      = fromCoord[0] * (1 - t)
        + toCoord[0] * t
        + Math.sin(Math.PI * t) * 20 // Adjust curve height

    curvePoints.push([y, x])
  }

  // Use condition color if provided, otherwise use traffic level color
  const lineColor = condition ? getConditionColor(condition) : getTrafficColor(trafficLevel)

  return L.polyline(curvePoints, {
    color: lineColor,
    weight: Math.max(3, trafficLevel / 20),
    opacity: 0.8,
    dashArray: '5, 5', // Dotted curve
  })
}

const MapComponent = ({ countryTrafficData, additionalCityConnections, cityToCityConnections, regionToCityConnections, regionToRegionConnections }: any) => {
  // Add state to track loaded connections
  const [loadedConnections, setLoadedConnections] = useState(0)
  const [map, setMap] = useState<L.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialHighPriorityDisplayed, setInitialHighPriorityDisplayed] = useState(false)
  const cityCoordinatesCache = useRef<Record<string, any>>({})
  const priorityConnections = useRef<any[]>([])

  console.log('%c Line:141 🍋 countryTrafficData', 'color:#93c0a4', { countryTrafficData, additionalCityConnections, regionToCityConnections, regionToRegionConnections })

  // New function to identify high priority connections to show first
  const identifyHighPriorityConnections = () => {
    const highPriority = []

    // Add highest traffic countries (e.g., top 5)
    if (countryTrafficData) {
      const sortedCountries = Object.entries(countryTrafficData)
        .sort((a: any, b: any) => b[1].trafficLevel - a[1].trafficLevel)
        .slice(0, 5)

      for (const [country, data] of sortedCountries) {
        highPriority.push({
          type: 'country',
          country,
          city: (data as any).city,
          trafficLevel: (data as any).trafficLevel,
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
        })
      }
    }

    return highPriority
  }

  useEffect(() => {
    // Identify high priority connections before map initialization
    priorityConnections.current = identifyHighPriorityConnections()
  }, [countryTrafficData, additionalCityConnections])

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
          const trafficLevel = countryTrafficData[countryName]?.trafficLevel

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
          const trafficLevel = countryTrafficData[countryName]?.trafficLevel

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
                Traffic Level: ${trafficLevel}%
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

      // Get Philippines coordinates early
      const philippinesCoordinates = await geocodeAddress('Manila, Philippines')
      if (philippinesCoordinates) {
        cityCoordinatesCache.current['Manila, Philippines'] = philippinesCoordinates

        // Add Philippines marker and label first
        addPhilippinesMarker(mapInstance, philippinesCoordinates)

        // Display high priority connections immediately
        displayHighPriorityConnections(mapInstance, philippinesCoordinates)
      }
    }

    initializeMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [countryTrafficData])

  // Function to add Philippines marker
  const addPhilippinesMarker = (mapInstance: L.Map, philippinesCoordinates: LatLngExpression) => {
    // Add a marker for the Philippines Server with a special style
    const philippinesIcon = L.divIcon({
      className: 'philippines-dot',
      html: `<div class="dot pulse-animation" style="background: #0000FF; width: 16px; height: 16px;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    const philippinesMarker = L.marker(philippinesCoordinates, { icon: philippinesIcon }).addTo(mapInstance)

    // Add Philippines label
    const philippinesLabelIcon = L.divIcon({
      className: 'city-label',
      html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .7em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">MANILA</div>`,
      iconSize: [80, 20],
      iconAnchor: [40, -15],
    })
    L.marker(philippinesCoordinates, { icon: philippinesLabelIcon }).addTo(mapInstance)

    // Add a highlighted circle for the Philippines
    L.circle(philippinesCoordinates, {
      color: '#0000FF',
      fillColor: '#0000FF',
      fillOpacity: 0.2,
      radius: 200000, // Larger radius for the central hub
      weight: 2,
    }).addTo(mapInstance)

    philippinesMarker.bindTooltip(
      `<div style="text-align: center;">
        <strong>Philippines Server</strong><br/>
        Central Hub
      </div>`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      }
    )
  }

  // Function to create a city marker with circle and label
  const createCityMarker = (mapInstance: L.Map, coordinates: LatLngExpression, name: string, trafficLevel: number, cityName = null) => {
    if (!coordinates) {
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

    const marker = L.marker(coordinates, { icon: divIcon }).addTo(mapInstance)

    // Add colored circle around the dot
    const circle = L.circle(coordinates, {
      color: dotColor,
      fillColor: dotColor,
      fillOpacity: 0.2,
      radius: 100000, // Adjust radius as needed (in meters)
      weight: 1,
    }).addTo(mapInstance)

    // Add city label - with black color and all uppercase
    const displayCityName: any = cityName || name
    const cityLabel = displayCityName?.split(',')[0].toUpperCase() // Extract just the city name before the comma and convert to uppercase

    const cityLabelIcon = L.divIcon({
      className: 'city-label',
      html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .7em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${cityLabel}</div>`,
      iconSize: [80, 20],
      iconAnchor: [40, -10], // Position label above the dot
    })
    L.marker(coordinates, { icon: cityLabelIcon }).addTo(mapInstance)

    // Add tooltip to the marker
    marker.bindTooltip(
      `<div style="text-align: center;">
        <strong>${cityName || name}</strong><br/>
        Traffic Level: ${trafficLevel}%
      </div>`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      }
    )

    return marker
  }

  // Function to display high priority connections immediately
  const displayHighPriorityConnections = async (mapInstance: L.Map, philippinesCoordinates: LatLngExpression) => {
    if (initialHighPriorityDisplayed) return

    for (const connection of priorityConnections.current) {
      try {
        let coordinates

        if (connection.type === 'country') {
          // Get coordinates for the country's main city
          if (!cityCoordinatesCache.current[connection.city]) {
            cityCoordinatesCache.current[connection.city] = await geocodeAddress(connection.city)
          }
          coordinates = cityCoordinatesCache.current[connection.city]

          if (coordinates) {
            // Create city marker
            createCityMarker(mapInstance, coordinates, connection.country, connection.trafficLevel, connection.city)

            // Create curved flow line
            const curvedLine = createCurvedFlowLine(
              philippinesCoordinates, coordinates, connection.trafficLevel, connection.city
            )

            if (curvedLine) {
              curvedLine.bindTooltip(
                `<div style="text-align: center;">
                  <strong>${connection.city}</strong><br/>
                  Traffic Level: ${connection.trafficLevel}%
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
          coordinates = cityCoordinatesCache.current[connection.city]

          if (coordinates) {
            // Create city marker
            createCityMarker(mapInstance, coordinates, connection.city, connection.trafficLevel)

            // Create curved flow line
            const curvedLine = createCurvedFlowLine(
              philippinesCoordinates, coordinates, connection.trafficLevel, connection.city
            )

            if (curvedLine) {
              curvedLine.bindTooltip(
                `<div style="text-align: center;">
                  <strong>${connection.city}</strong><br/>
                  Traffic Level: ${connection.trafficLevel}%
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
      // Get Philippines coordinates (central hub) - reuse from cache if available
      let philippinesCoordinates
      if (cityCoordinatesCache.current['Manila, Philippines']) {
        philippinesCoordinates = cityCoordinatesCache.current['Manila, Philippines']
      }
      else {
        philippinesCoordinates = await geocodeAddress('Manila, Philippines')
        cityCoordinatesCache.current['Manila, Philippines'] = philippinesCoordinates
      }

      if (!philippinesCoordinates) {
        console.error('Could not get coordinates for Philippines hub')
        return
      }

      // Prepare all connections for staged loading
      const allConnections: any[] = []

      // 1. Get coordinates for countries in trafficData
      const cityCoordinates: any = { ...cityCoordinatesCache.current }
      const countryCoordinates: any = {}

      // Pre-fetch all coordinates first
      for (const country in countryTrafficData) {
        if (!cityCoordinates[countryTrafficData[country].city]) {
          cityCoordinates[countryTrafficData[country].city] = await geocodeAddress(countryTrafficData[country].city)
          cityCoordinatesCache.current[countryTrafficData[country].city] = cityCoordinates[countryTrafficData[country].city]
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
      Object.keys(countryTrafficData).forEach((country) => {
        const { trafficLevel, city } = countryTrafficData[country]
        const coordinates = cityCoordinates[city]

        // Skip high priority connections that were already displayed
        const isHighPriority = priorityConnections.current.some(conn => conn.type === 'country' && conn.country === country
        )

        if (coordinates && !isHighPriority) {
          allConnections.push({
            type: 'country',
            fromCoord: philippinesCoordinates,
            toCoord: coordinates,
            name: city,
            displayName: city,
            trafficLevel,
            condition: null,
            callback: () => createCityMarker(map, coordinates, country, trafficLevel, city),
          })
        }
      })

      // 3. Prepare Additional City connections
      additionalCityConnections.forEach((cityData) => {
        const { city, trafficLevel } = cityData
        const coordinates = additionalCityCoordinates[city]

        // Skip high priority connections that were already displayed
        const isHighPriority = priorityConnections.current.some(conn => conn.type === 'additionalCity' && conn.city === city
        )

        if (coordinates && !isHighPriority) {
          allConnections.push({
            type: 'additionalCity',
            fromCoord: philippinesCoordinates,
            toCoord: coordinates,
            name: city,
            displayName: city,
            trafficLevel,
            condition: null,
            callback: () => createCityMarker(map, coordinates, city, trafficLevel),
          })
        }
      })

      // 4. Prepare Region-to-Region connections
      regionToRegionConnections.forEach((connection) => {
        const { toRegion, trafficLevel, condition } = connection as Record<string, any>
        const toCoordinates = regionCoordinates[toRegion]

        if (toCoordinates) {
          allConnections.push({
            type: 'regionToRegion',
            fromCoord: philippinesCoordinates,
            toCoord: toCoordinates,
            name: `Philippines to ${toRegion}`,
            displayName: `NCR Region to ${toRegion}`,
            trafficLevel,
            condition,
            callback: () => createCityMarker(map, toCoordinates, toRegion, trafficLevel),
          })
        }
      })

      // 5. Prepare Region-to-City connections
      regionToCityConnections.forEach((connection) => {
        const { fromRegion, toCity, trafficLevel, condition } = connection as Record<string, any>
        const fromCoordinates = countryCoordinates[fromRegion]
        const toCityCoordinates = additionalCityCoordinates[toCity]

        if (fromCoordinates && toCityCoordinates) {
          allConnections.push({
            type: 'regionToCity',
            fromCoord: fromCoordinates,
            toCoord: toCityCoordinates,
            name: `${fromRegion} to ${toCity}`,
            displayName: `${fromRegion} to ${toCity}`,
            trafficLevel,
            condition,
            callback: null, // No need for markers as they'll be created by other connection types
          })
        }
      })

      // 6. Prepare City-to-City connections
      cityToCityConnections.forEach((connection) => {
        const { fromCity, toCity, trafficLevel, condition } = connection as Record<string, any>
        const fromCityCoordinates = additionalCityCoordinates[fromCity]
        const toCityCoordinates = additionalCityCoordinates[toCity]

        if (fromCityCoordinates && toCityCoordinates) {
          allConnections.push({
            type: 'cityToCity',
            fromCoord: fromCityCoordinates,
            toCoord: toCityCoordinates,
            name: `${fromCity} to ${toCity}`,
            displayName: `${fromCity} to ${toCity}`,
            trafficLevel,
            condition,
            callback: null, // No need for markers as they'll be created by other connection types
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

        // Execute callback to create marker if provided
        if (connection.callback) {
          connection.callback()
        }

        // Create and add curved line
        const curvedLine = createCurvedFlowLine(
          connection.fromCoord, connection.toCoord, connection.trafficLevel, connection.name, connection.condition
        )

        if (curvedLine) {
          const tooltipContent = connection.condition
            ? `<div style="text-align: center;">
              <strong>${connection.displayName}</strong><br/>
              Traffic Level: ${connection.trafficLevel}%<br/>
              Condition: ${connection.condition}
            </div>`
            : `<div style="text-align: center;">
              <strong>${connection.displayName}</strong><br/>
              Traffic Level: ${connection.trafficLevel}%
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
          loadNextBatchOfConnections()
        }, 1000) // 1 second delay between batches
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
            <div><span style="display:inline-block; width:15px; height:15px; background:#0000FF; border-radius:50%;"></span> Philippines Server</div>
            
            <strong style="margin-top: 10px; display: block;">Connection Conditions</strong>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 0, 0, 0.7);"></span> Congested</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 0, 255, 0.7);"></span> High Latency</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 165, 0, 0.7);"></span> Low Bandwidth</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(255, 255, 0, 0.7);"></span> Normal</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(0, 191, 255, 0.7);"></span> Stable</div>
            <div><span style="display:inline-block; width:15px; height:3px; background:rgba(0, 128, 0, 0.7);"></span> Optimized</div>
          </div>
        `
        return div
      }
      legend.addTo(map)
    }

    // Start the loading process for the first time if high priority connections are already displayed
    if (initialHighPriorityDisplayed && loadedConnections === 0) {
      loadNextBatchOfConnections()
    }
  }, [map, isLoading, loadedConnections, countryTrafficData, additionalCityConnections, cityToCityConnections, regionToCityConnections, regionToRegionConnections, initialHighPriorityDisplayed])

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
      (countryTrafficData ? Object.keys(countryTrafficData).length : 0)
      + (additionalCityConnections ? additionalCityConnections.length : 0)
      + (regionToRegionConnections ? regionToRegionConnections.length : 0)
      + (regionToCityConnections ? regionToCityConnections.length : 0)
      + (cityToCityConnections ? cityToCityConnections.length : 0)
      - highPriorityCount // Subtract high priority connections that were already displayed
    )

    if (loadedConnections >= totalConnections) {
      return null // Don't show when complete
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
        <div className = "loading-overlay">
          {loadingStatus}
        </div>
      )}
    </>
  )
}

export default MapComponent
