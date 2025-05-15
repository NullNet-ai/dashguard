'use client'

import L, { type LatLngExpression } from 'leaflet'
import { useEffect, useState, useRef, useCallback } from 'react'
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
const geocodeAddress = async (address: string) => {
  // Don't try to geocode "No IP Info"
  if (address === "No IP Info") return null;
  
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
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
const DEFAULT_SEA_COORDINATES = [0, -30]

// Function to create a **curved** traffic flow line using Bezier curves
const createCurvedFlowLine = (fromCoord: any, toCoord: any, trafficLevel: any, name: any, condition = null) => {
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

const MapComponent = ({ countryTrafficData }: Record<string, any>) => {
  const { ipData = [] } = countryTrafficData ?? {};
  const [loadedConnections, setLoadedConnections] = useState(0);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialHighPriorityDisplayed, setInitialHighPriorityDisplayed] = useState(false);
  const cityCoordinatesCache: any = useRef({});
  const priorityConnections: any = useRef([]);
  // Reference to maintain country GeoJSON data
  const countriesGeoJSON: any = useRef(null);
  // Reference to maintain country highlights
  const countryHighlights: any = useRef({});

  // Get traffic color based on level
  const getTrafficColor = (trafficLevel: number) => {
    if (trafficLevel > 80) return 'rgba(255, 0, 0, 0.7)';
    if (trafficLevel > 50) return 'rgba(255, 165, 0, 0.7)';
    if (trafficLevel > 30) return 'rgba(255, 255, 0, 0.7)';
    return 'rgba(0, 128, 0, 0.7)';
  };

  // Function to generate coordinates in major oceans
  const generateOceanCoordinates = () => {
    // Define major ocean regions (approximate)
    const oceanRegions = [
      // Pacific Ocean
      { lat: [-50, 40], lng: [-170, -120] },
      { lat: [-50, 40], lng: [150, 180] },
      // Atlantic Ocean
      { lat: [-40, 50], lng: [-60, -20] },
      // Indian Ocean
      { lat: [-40, 20], lng: [60, 100] },
      // Southern Ocean
      { lat: [-65, -50], lng: [-180, 180] },
      // Arctic Ocean
      { lat: [75, 85], lng: [-180, 180] },
    ];

    // Select a random ocean region
    const region: any = oceanRegions[Math.floor(Math.random() * oceanRegions.length)];
    
    // Generate random coordinates within the selected region
    const lat = region.lat[0] + Math.random() * (region.lat[1] - region.lat[0]);
    const lng = region.lng[0] + Math.random() * (region.lng[1] - region.lng[0]);
    
    return [lat, lng];
  };

  // Check if a point is on land using the GeoJSON data
  const isPointOnLand = useCallback((lat: any, lng: any) => {
    if (!countriesGeoJSON.current) return false;
    
    const point = L.latLng(lat, lng);
    
    // Check if the point is inside any country polygon
    for (const feature of countriesGeoJSON.current.features) {
      if (feature.geometry.type === 'Polygon') {
        const polygon = L.polygon(feature.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]]));
        if (polygon.getBounds().contains(point)) {
          return true;
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        for (const polygonCoords of feature.geometry.coordinates) {
          const polygon = L.polygon(polygonCoords[0].map((coord: any) => [coord[1], coord[0]]));
          if (polygon.getBounds().contains(point)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }, []);

  // Generate coordinates that are guaranteed to be in the ocean
  const getGuaranteedOceanCoordinates = useCallback(() => {
    let attempts = 0;
    let coordinates;
    
    do {
      coordinates = generateOceanCoordinates();
      attempts++;
      // After many attempts, just use a deep ocean coordinate that's almost certainly not land
      if (attempts > 10) {
        // Pacific Ocean deep water coordinates
        return [-30 + Math.random() * 20, -160 + Math.random() * 40];
      }
    } while (isPointOnLand(coordinates[0], coordinates[1]));
    
    return coordinates;
  }, [isPointOnLand]);

  // Find country by coordinates
  const findCountryByCoordinates = useCallback((lat: any, lng: any) => {
    if (!countriesGeoJSON.current) return null;
    
    const point = L.latLng(lat, lng);
    
    for (const feature of countriesGeoJSON.current.features) {
      const countryName = feature.properties.name;
      
      if (feature.geometry.type === 'Polygon') {
        const polygon = L.polygon(feature.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]]));
        if (polygon.getBounds().contains(point)) {
          return { name: countryName, feature };
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        for (const polygonCoords of feature.geometry.coordinates) {
          const polygon = L.polygon(polygonCoords[0].map((coord: any) => [coord[1], coord[0]]));
          if (polygon.getBounds().contains(point)) {
            return { name: countryName, feature };
          }
        }
      }
    }
    
    return null;
  }, []);

  // Highlight a country on the map
  const highlightCountry = useCallback((mapInstance: any, countryName: any, coordinates: any) => {
    // Skip if it's Ocean or No IP Info
    if (countryName === 'Ocean' || countryName === 'No IP Info') return;
    
    // If we already highlighted this country, return
    if (countryHighlights.current[countryName]) return;
    
    // First try to find the country feature by name
    let countryFeature = null;
    
    if (countriesGeoJSON.current) {
      // Find country by exact name match
      for (const feature of countriesGeoJSON.current.features) {
        if (feature.properties.name === countryName) {
          countryFeature = feature;
          break;
        }
      }
      
      // If not found by exact match, try case-insensitive match
      if (!countryFeature) {
        for (const feature of countriesGeoJSON.current.features) {
          if (feature.properties.name.toLowerCase() === countryName.toLowerCase()) {
            countryFeature = feature;
            countryName = feature.properties.name; // Use the proper case from GeoJSON
            break;
          }
        }
      }
      
      // If we still couldn't find by name, try to find by coordinates
      if (!countryFeature && coordinates) {
        const country = findCountryByCoordinates(coordinates[0], coordinates[1]);
        if (country) {
          countryFeature = country.feature;
          countryName = country.name; // Update country name in case it was different
        }
      }
      
      // If we found the country, highlight it
      if (countryFeature) {
        
        // Generate a unique color for this country for visual distinction
      const hue = Math.floor(Math.random() * 360);
      const highlightColor = `hsla(${hue}, 70%, 50%, 0.3)`;
      const borderColor = `hsla(${hue}, 70%, 40%, 0.7)`;

      const highlight = L.geoJSON(countryFeature, {
        style: {
          fillColor: highlightColor,
          weight: 2,
          opacity: 1,
          color: borderColor,
          fillOpacity: 0.3,
        },
      }).addTo(mapInstance);

      // Add a country label
      const bounds = highlight.getBounds();
      const center = bounds.getCenter();

      // Create a simple label using a div element
      const labelDiv = L.divIcon({
        className: 'country-label', // Custom class for styling
        html: `<div class="country-name">${countryName}</div>`, // Set the country name as content
        iconSize: [0, 0], // No icon size, just the label
        iconAnchor: [0, 0], // Anchor point for the label
      });

      L.marker(center, { icon: labelDiv }).addTo(mapInstance);

      // Store the highlight for future reference
      countryHighlights.current[countryName] = { highlight };
      } else {
        console.warn(`Could not find GeoJSON data for country: ${countryName}`);
      }
    }
  }, [findCountryByCoordinates]);

  // Process IP data to create connection data
  const processIpData = useCallback(async () => {
    if (!ipData || !Array.isArray(ipData)) return [];

    const processedData = [];
    
    for (const connection of ipData) {
      const { 
        source_ip, 
        destination_ip, 
        source_country, 
        destination_country,
        source_coordinates,
        destination_coordinates
      } = connection;

      // Use provided coordinates if available, otherwise geocode the country
      let sourceCoordinates = source_coordinates;
      let destCoordinates = destination_coordinates;
      let sourceIsNoIpInfo = false;
      let destIsNoIpInfo = false;
      
      // Check if source is "No IP Info"
      if (source_country && source_country.country === "No IP Info") {
        sourceIsNoIpInfo = true;
      }
      
      // Check if destination is "No IP Info"
      if (destination_country && destination_country.country === "No IP Info") {
        destIsNoIpInfo = true;
      }
      
      // For source: geocode if we have country info but no coordinates
      if (!sourceCoordinates && source_country && source_country.country && !sourceIsNoIpInfo) {
        // Check cache first
        const cacheKey = `${source_country.country}${source_country.city ? '-' + source_country.city : ''}`;
        if (cityCoordinatesCache.current[cacheKey]) {
          sourceCoordinates = cityCoordinatesCache.current[cacheKey];
        } else {
          // Try to geocode with city if available
          const addressToGeocode = source_country.city 
            ? `${source_country.city}, ${source_country.country}`
            : source_country.country;
          
          const geocodedCoords = await geocodeAddress(addressToGeocode);
          if (geocodedCoords) {
            sourceCoordinates = geocodedCoords;
            cityCoordinatesCache.current[cacheKey] = geocodedCoords;
          }
        }
      }
      
      // For destination: geocode if we have country info but no coordinates
      if (!destCoordinates && destination_country && destination_country.country && !destIsNoIpInfo) {
        // Check cache first
        const cacheKey = `${destination_country.country}${destination_country.city ? '-' + destination_country.city : ''}`;
        if (cityCoordinatesCache.current[cacheKey]) {
          destCoordinates = cityCoordinatesCache.current[cacheKey];
        } else {
          // Try to geocode with city if available
          const addressToGeocode = destination_country.city 
            ? `${destination_country.city}, ${destination_country.country}`
            : destination_country.country;
          
          const geocodedCoords = await geocodeAddress(addressToGeocode);
          if (geocodedCoords) {
            destCoordinates = geocodedCoords;
            cityCoordinatesCache.current[cacheKey] = geocodedCoords;
          }
        }
      }
      
      // For IPs without country data or "No IP Info", generate ocean coordinates
      if (!sourceCoordinates || sourceIsNoIpInfo) {
        sourceCoordinates = getGuaranteedOceanCoordinates();
      }
      
      if (!destCoordinates || destIsNoIpInfo) {
        destCoordinates = getGuaranteedOceanCoordinates();
      }

      // Calculate traffic level if not provided
      const trafficLevel = connection.trafficLevel || 10 + (Math.random() * 80);

      // Determine condition based on traffic pattern
      let condition = null;
      if (trafficLevel > 80) condition = 'Congested';
      else if (trafficLevel > 60) condition = 'High Latency';
      else if (trafficLevel > 40) condition = 'Low Bandwidth';
      else if (trafficLevel > 20) condition = 'Normal';
      else condition = 'Stable';

      processedData.push({
        source_ip,
        destination_ip,
        sourceLocation: sourceIsNoIpInfo ? 'Ocean' : (source_country && source_country.country) || 'Ocean',
        destinationLocation: destIsNoIpInfo ? 'Ocean' : (destination_country && destination_country.country) || 'Ocean',
        sourceCoordinates,
        destinationCoordinates: destCoordinates,
        trafficLevel,
        condition,
        source_country,
        destination_country,
        sourceIsNoIpInfo,
        destIsNoIpInfo
      });
    }
    
    return processedData;
  }, [ipData, getGuaranteedOceanCoordinates]);

  // Identify high priority connections to show first
  const identifyHighPriorityConnections = useCallback(async () => {
    const ipConnections = await processIpData();
    if (!ipConnections || ipConnections.length === 0) return [];

    // Get top connections by traffic level
    return [...ipConnections]
      .sort((a, b) => b.trafficLevel - a.trafficLevel)
      .slice(0, Math.min(5, ipConnections.length));
  }, [processIpData]);

  // Initialize high priority connections
  useEffect(() => {
    const initPriorityConnections = async () => {
      priorityConnections.current = await identifyHighPriorityConnections();
    };
    
    initPriorityConnections();
  }, [identifyHighPriorityConnections]);

  // Create source marker
  const createSourceMarker = (
    mapInstance: any,
    coordinates: any,
    locationName: any,
    source_ip: any
  ) => {
    const dotColor = '#00BFFF';
    
    const divIcon = L.divIcon({
      className: 'source-dot',
      html: `<div class="dot" style="background:${dotColor}; width:6px; height:6px;"></div>`,
      iconSize: [6, 6],
      iconAnchor: [3, 3],
    });
    
    const marker = L.marker(coordinates, { icon: divIcon }).addTo(mapInstance);
    
    // Add tooltip with more details including the source IP
    marker.bindTooltip(
      `<div style="text-align: center;">
        <strong>Source</strong><br/>
        <span style="color: #00BFFF;">IP: ${source_ip}</span><br/>
        ${locationName}
      </div>`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      }
    );
    
    return marker;
  };

  // Create destination marker
  const createDestinationMarker = (
    mapInstance: any, 
    coordinates: any, 
    locationName: any, 
    trafficLevel: any, 
    destination_ip: any
  ) => {
    const dotColor = getTrafficColor(trafficLevel);
    
    const divIcon = L.divIcon({
      className: 'destination-dot',
      html: `<div class="dot" style="background:${dotColor}; width:6px; height:6px;"></div>`,
      iconSize: [6, 6],
      iconAnchor: [3, 3],
    });
    
    const marker = L.marker(coordinates, { icon: divIcon }).addTo(mapInstance);
    
    // Add tooltip with more details
    marker.bindTooltip(
      `<div style="text-align: center;">
        <strong>Destination</strong><br/>
        <span style="color: ${dotColor};">IP: ${destination_ip}</span><br/>
        ${locationName}<br/>
        Traffic Level: ${trafficLevel}%<br/>
        ${trafficLevel > 80 ? '⚠️ Congested' : ''}
      </div>`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      }
    );
    
    return marker;
  };

  // Create flow line between points
  const createFlowLine = (
    from: any,
    to: any,
    trafficLevel: any,
    condition = null
  ) => {
    // Determine line color based on condition or traffic level
    let lineColor = getTrafficColor(trafficLevel);
    
    if (condition) {
      switch (condition) {
        case 'Congested': lineColor = 'rgba(255, 0, 0, 0.7)'; break;
        case 'High Latency': lineColor = 'rgba(255, 0, 255, 0.7)'; break;
        case 'Low Bandwidth': lineColor = 'rgba(255, 165, 0, 0.7)'; break;
        case 'Normal': lineColor = 'rgba(255, 255, 0, 0.7)'; break;
        case 'Stable': lineColor = 'rgba(0, 191, 255, 0.7)'; break;
      }
    }
    
    // Calculate line width based on traffic level (1-3px)
    const lineWidth = 1 + Math.floor(trafficLevel / 30);
    
    // Create curved line between points
    const curvePoints: any = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Create a curved path using sine function for curvature
      const lng = from[1] * (1 - t) + to[1] * t;
      const lat = from[0] * (1 - t) + to[0] * t + Math.sin(Math.PI * t) * 5;
      
      curvePoints.push([lat, lng]);
    }
    
    // Create the curved line
    const line = L.polyline(curvePoints, {
      color: lineColor,
      weight: lineWidth,
      opacity: 0.8,
      dashArray: '5, 5',
      className: 'traffic-flow-line',
    });
    
    return line;
  };

  // Fetch country borders
  const fetchGeoJSON = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
      const data = await response.json();
      countriesGeoJSON.current = data; // Store the GeoJSON data for later use
      return data;
    } catch (error) {
      console.error('Error fetching country borders:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  };

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      const mapInstance: any = L.map('map', {
        center: [20, 0], // Center on equator
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        worldCopyJump: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1.0,
      });
      
      // Add base tile layer
      L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stamen.com/">Stamen Maps</a>',
        maxZoom: 20,
      }).addTo(mapInstance);
      
      // Add world borders
      const countries = await fetchGeoJSON();
      L.geoJSON(countries, {
        style: {
          fillColor: 'transparent',
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.1,
        }
      }).addTo(mapInstance);
      
      // Add legend
      addLegend(mapInstance);
      
      setMap(mapInstance);
      setIsLoading(false);
    };
    
    // Add legend to map
    const addLegend = (mapInstance: any) => {
      // @ts-expect-error - Leaflet control
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
          <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);">
            <strong>Traffic Level</strong><br>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 0, 0, 0.7); border-radius:50%;"></span> Very High (>80%) - Congested</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 0, 255, 0.7); border-radius:50%;"></span> High Latency</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 165, 0, 0.7); border-radius:50%;"></span> Low Bandwidth (50-80%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 255, 0, 0.7); border-radius:50%;"></span> Normal (30-50%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:rgba(0, 128, 0, 0.7); border-radius:50%;"></span> Stable (<30%)</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:#00BFFF; border-radius:50%;"></span> Source IP</div>
            <div><span style="display:inline-block; width:15px; height:15px; background:#3388ff; opacity:0.2; border:1px solid #3388ff;"></span> Highlighted Country</div>
          </div>
        `;
        return div;
      };
      legend.addTo(mapInstance);
    };
    
    initializeMap().catch(console.error);
    
    return () => {
      if (map) map.remove();
    };
  }, []);

  // Load connections once map is initialized
  useEffect(() => {
    if (!map || isLoading) return;
    
    const loadAllConnections = async () => {
      const allConnections = await processIpData();
      
      for (const conn of allConnections) {
        // Create markers with appropriate info
        const sourceLabel = conn.sourceIsNoIpInfo ? 'Ocean (No IP Info)' : conn.sourceLocation;
        const destLabel = conn.destIsNoIpInfo ? 'Ocean (No IP Info)' : conn.destinationLocation;
        
        // Create source marker
        createSourceMarker(
          map, 
          conn.sourceCoordinates, 
          sourceLabel, 
          conn.source_ip
        );
        
        // Create destination marker
        createDestinationMarker(
          map, 
          conn.destinationCoordinates, 
          destLabel, 
          conn.trafficLevel, 
          conn.destination_ip
        );
        
        // Create flow line between points
        const line = createFlowLine(
          conn.sourceCoordinates,
          conn.destinationCoordinates,
          conn.trafficLevel,
          //@ts-expect-error - condition is optional
          conn.condition
        );
        
        if (line) {
          // Create detailed tooltip for the connection
          line.bindTooltip(
            `<div style="text-align: center;">
              <strong>Network Connection</strong><br/>
              <span style="color: #00BFFF;">From: ${conn.source_ip}</span><br/>
              <span style="color: ${getTrafficColor(conn.trafficLevel)};">To: ${conn.destination_ip}</span><br/>
              <hr style="margin: 4px 0;">
              <span>Source: ${sourceLabel}</span><br/>
              <span>Destination: ${destLabel}</span><br/>
              <span>Traffic: ${conn.trafficLevel.toFixed(1)}%</span><br/>
              ${conn.condition ? `<span>Status: ${conn.condition}</span>` : ''}
            </div>`, {
              permanent: false,
              direction: 'center',
              className: 'custom-tooltip',
            }
          );
          line.addTo(map);
        }
        
        // Highlight countries if they have valid locations (not Ocean or No IP Info)
        if (!conn.sourceIsNoIpInfo && conn.sourceLocation && conn.sourceLocation !== 'Ocean') {
          highlightCountry(map, conn.sourceLocation, conn.sourceCoordinates);
        }
        
        if (!conn.destIsNoIpInfo && conn.destinationLocation && conn.destinationLocation !== 'Ocean') {
          highlightCountry(map, conn.destinationLocation, conn.destinationCoordinates);
        }
      }
      
      setLoadedConnections(allConnections.length);
      setInitialHighPriorityDisplayed(true);
    };
    
    loadAllConnections();
  }, [map, isLoading, processIpData, highlightCountry]);

  return (
    <>
      <style>
        {`
          .source-dot .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            position: absolute;
            animation: pulse 2s infinite;
          }
          
          .destination-dot .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            position: absolute;
            animation: twinkle 1.5s infinite ease-in-out;
          }
          
          .traffic-flow-line {
            animation: flowLine 2s infinite linear;
            stroke-dasharray: 10, 20;
            stroke-dashoffset: 0;
          }

          .custom-tooltip {
            background-color: rgba(255, 255, 255, 0.9);
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            font-family: geist, sans-serif;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            max-width: 200px;
          }
          
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
          }
          
          .stats-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: geist, sans-serif;
            font-size: 14px;
            max-width: 250px;
          }

          .country-label {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            background: none;
            border: none;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
            pointer-events: none; /* Prevent interaction with the label */
          }
          
          .country-name {
            padding: 3px 8px;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.2);
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            white-space: nowrap;
            box-shadow: 0 1px 5px rgba(0,0,0,0.2);
            pointer-events: none;
            text-shadow: 0 0 2px white;
          }
          
          .ocean-label {
            font-style: italic;
            color: #0077be;
            font-size: 10px;
            text-shadow: 0 0 2px white;
          }
          
          @keyframes twinkle {
            0% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.3; transform: scale(1); }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 191, 255, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(0, 191, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 191, 255, 0); }
          }
          
          @keyframes flowLine {
            from { stroke-dashoffset: 30; }
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
      
      {isLoading && (
        <div className="loading-overlay">
          <div>Initializing map...</div>
          <div>Loading country data...</div>
        </div>
      )}
      
      {/* {!isLoading && loadedConnections > 0 && (
        <div className="stats-panel">
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #ccc' }}>Connection Statistics</h3>
          <div>Connections: {loadedConnections}</div>
          <div>Countries: {Object.keys(countryHighlights.current).length}</div>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
            <div>• Source IPs shown in blue</div>
            <div>• Destination IPs colored by traffic level</div>
            <div>• "No IP Info" coordinates placed in ocean</div>
            <div>• Hover over connections for details</div>
          </div>
        </div>
      )} */}
    </>
  )
}

export default MapComponent

