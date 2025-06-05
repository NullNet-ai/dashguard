'use client'

import L from 'leaflet'
import { useEffect, useState, useRef, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import 'leaflet-arc'
import * as turf from '@turf/turf';
import { COUNTRY_ALIASES, MANUAL_COUNTRY_COORDINATES } from '../functions/countriesAliasAndCoordinates'
import { findValidPointInPolygon } from '../functions/findValidPointInPolygon'
import { geocodeAddress } from '../functions/geocodeAddress'
import { getTrafficColor } from '../functions/getTrafficColor'
import { fetchGeoJSON } from '../functions/fetchGeoJSON'
import { normalizeLatLng } from '../functions/normalizeLatLng'
import { animateFlowLine } from '../functions/animateFlowLine'
import { updateDataPoints } from '../functions/updateDataPoints'
import { generateOceanCoordinates } from '../functions/generateOceanCoordinates'
import { getConnectionKey } from '../functions/getConnectionKey'
import { createDestinationMarker, createSourceMarker, ORANGE } from '../functions/createMarker'

const MapComponent = ({ countryTrafficData }: Record<string, any>) => {
  const { ipData = [] } = countryTrafficData ?? {};
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cityCoordinatesCache: any = useRef({});
  const ipCoordinatesCache: any = useRef({}); // New cache to store IP-to-coordinates mappings
  const countriesGeoJSON: any = useRef(null);
  const countryHighlights: any = useRef({});
  const activeConnections: any = useRef({});
  const priorityConnections: any = useRef([]);
  const connectionElements: any = useRef({});

  // Check if a point is on land using the GeoJSON data
  const isPointOnLand = useCallback((lat: any, lng: any) => {
    if (!countriesGeoJSON.current) return false;
    
    const point = turf.point([lng, lat]);
    
    // Check if the point is inside any country polygon
    for (const feature of countriesGeoJSON.current.features) {
      if (feature.geometry.type === 'Polygon') {
        try {
          if (turf.booleanPointInPolygon(point, feature)) {
            return true;
          }
        } catch (e) {
          console.error("Error checking polygon:", e);
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        try {
          if (turf.booleanPointInPolygon(point, feature)) {
            return true;
          }
        } catch (e) {
          console.error("Error checking multipolygon:", e);
        }
      }
    }
    
    return false;
  }, []);

  // Generate coordinates that are guaranteed to be in the ocean
  const getGuaranteedOceanCoordinates = useCallback(() => {
    let attempts = 0;
    let coordinates = generateOceanCoordinates();
  
    // Optionally, check that the point is not on land
    while (isPointOnLand(coordinates[0], coordinates[1]) && attempts < 10) {
      coordinates = generateOceanCoordinates();
      attempts++;
    }
  
    return coordinates;
  }, [isPointOnLand]);

  // Find country by coordinates
  const findCountryByCoordinates = useCallback((lat: number, lng: number) => {
    if (!countriesGeoJSON.current) return null;

    const point = turf.point([lng, lat]); // Create a GeoJSON point

    for (const feature of countriesGeoJSON.current.features) {
      try {
        const polygon = turf.feature(feature.geometry); // Convert the feature geometry to a turf feature

        if (turf.booleanPointInPolygon(point, polygon)) {
          return {
            name: feature.properties.name,
            feature,
          };
        }
      } catch (e) {
        console.error("Error checking country:", e);
      }
    }

    return null;
  }, []);

  const highlightCountry = useCallback(
    (mapInstance: any, countryName: string) => {
      if (!countryName || countryName === 'Ocean' || countryName === 'No IP Info') return null;
  
      const searchName = COUNTRY_ALIASES[countryName.trim()] || countryName.trim();
  
      if (countryHighlights.current[searchName]) {
        const { highlight, label } = countryHighlights.current[searchName];
        if (highlight && !mapInstance.hasLayer(highlight)) highlight.addTo(mapInstance);
        if (label && !mapInstance.hasLayer(label)) label.addTo(mapInstance);
        return countryHighlights.current[searchName].coordinates;
      }
  
      // Check if we have manual coordinates for this country
      if (MANUAL_COUNTRY_COORDINATES[searchName]) {
        const coordinates = MANUAL_COUNTRY_COORDINATES[searchName];
        
        // Still try to find and highlight the country polygon if available
        let countryFeature = null;
        if (countriesGeoJSON.current) {
          countryFeature = countriesGeoJSON.current.features.find(
            (feature: any) => feature.properties.name === searchName
          );
          
          if (!countryFeature) {
            countryFeature = countriesGeoJSON.current.features.find(
              (feature: any) => feature.properties.name.toLowerCase() === searchName.toLowerCase()
            );
          }
          
          if (countryFeature) {
            const highlightColor = 'rgba(255, 0, 0, 0.3)'; // RED highlight
            const borderColor = 'rgba(255, 0, 0, 0.7)';    // RED border
            const highlight = L.geoJSON(countryFeature, {
              style: {
                fillColor: highlightColor,
                weight: 2,
                opacity: 1,
                color: borderColor,
                fillOpacity: 0.3,
              },
            }).addTo(mapInstance);

            const label = L.marker(coordinates, {
              icon: L.divIcon({
                className: 'country-label',
                html: `<div class="country-name">${countryFeature.properties.name}</div>`,
                iconSize: [0, 0],
              }),
            }).addTo(mapInstance);

            countryHighlights.current[searchName] = { highlight, coordinates, label };
            return coordinates;
          }
        }
        
        // If no polygon found but we have manual coordinates, still return them
        countryHighlights.current[searchName] = { highlight: null, coordinates, label: null };
        return coordinates;
      }
  
      let countryFeature = null;
  
      if (countriesGeoJSON.current) {
        countryFeature = countriesGeoJSON.current.features.find(
          (feature: any) => feature.properties.name === searchName
        );
        if (!countryFeature) {
          countryFeature = countriesGeoJSON.current.features.find(
            (feature: any) => feature.properties.name.toLowerCase() === searchName.toLowerCase()
          );
        }
        if (!countryFeature) {
          countryFeature = countriesGeoJSON.current.features.find(
            (feature: any) => feature.properties.name.toLowerCase().includes(searchName.toLowerCase())
          );
        }
        if (countryFeature) {
          const highlightColor = 'rgba(255, 0, 0, 0.3)'; // RED highlight
          const borderColor = 'rgba(255, 0, 0, 0.7)';    // RED border
          const highlight = L.geoJSON(countryFeature, {
            style: {
              fillColor: highlightColor,
              weight: 2,
              opacity: 1,
              color: borderColor,
              fillOpacity: 0.3,
            },
          }).addTo(mapInstance);
  
          // Use the improved coordinate finding function
          let coordinates = findValidPointInPolygon(countryFeature);
          
          // If still no valid coordinates found, fall back to bounds center
          if (!coordinates) {
            const bounds = highlight.getBounds();
            coordinates = [bounds.getCenter().lat, bounds.getCenter().lng];
          }
  
          const label = L.marker(coordinates, {
            icon: L.divIcon({
              className: 'country-label',
              html: `<div class="country-name">${countryFeature.properties.name}</div>`,
              iconSize: [0, 0],
            }),
          }).addTo(mapInstance);
  
          countryHighlights.current[searchName] = { highlight, coordinates, label };
          return coordinates;
        } else {
          console.warn("Country not found in GeoJSON:", searchName);
        }
      }
      return null;
    },
    [countriesGeoJSON]
  );


  // Process IP data to create connection data
  const processIpData = useCallback(async () => {
    if (!ipData || !Array.isArray(ipData)) return [];

    // First, build an IP to coordinates mapping to ensure consistent coordinates
    const ipAddressToCoordinates = { ...ipCoordinatesCache.current };
    
    // Prepare all IP addresses first
    for (const connection of ipData) {
      const { 
        source_ip, 
        destination_ip,
        source_country,
        destination_country,
        source_coordinates,
        destination_coordinates
      } = connection;

      // Handle source IP
      if (source_ip && !ipAddressToCoordinates[source_ip]) {
        if (source_coordinates) {
          // Use provided coordinates
          ipAddressToCoordinates[source_ip] = source_coordinates;
        } else if (source_country && source_country.country && source_country.country !== "No IP Info") {
          // Geocode country/city
          const cacheKey = `${source_country.country}${source_country.city ? '-' + source_country.city : ''}`;
          if (cityCoordinatesCache.current[cacheKey]) {
            ipAddressToCoordinates[source_ip] = cityCoordinatesCache.current[cacheKey];
          } else {
            const addressToGeocode = source_country.city
              ? `${source_country.city}, ${source_country.country}`
              : source_country.country;
      
            const geocodedCoords = await geocodeAddress(addressToGeocode);
            if (geocodedCoords) {
              ipAddressToCoordinates[source_ip] = geocodedCoords;
              cityCoordinatesCache.current[cacheKey] = geocodedCoords;
            } else {
              // Generate ocean coordinates for IPs without location
              ipAddressToCoordinates[source_ip] = getGuaranteedOceanCoordinates();
            }
          }
        } else {
          // Explicitly handle "No IP Info"
          ipAddressToCoordinates[source_ip] = getGuaranteedOceanCoordinates();
        }
      }

      // Handle destination IP
      if (destination_ip && !ipAddressToCoordinates[destination_ip]) {
        if (destination_coordinates) {
          // Use provided coordinates
          ipAddressToCoordinates[destination_ip] = destination_coordinates;
        } else if (destination_country && destination_country.country && destination_country.country !== "No IP Info") {
          // Geocode country/city
          const cacheKey = `${destination_country.country}${destination_country.city ? '-' + destination_country.city : ''}`;
          if (cityCoordinatesCache.current[cacheKey]) {
            ipAddressToCoordinates[destination_ip] = cityCoordinatesCache.current[cacheKey];
          } else {
            const addressToGeocode = destination_country.city 
              ? `${destination_country.city}, ${destination_country.country}`
              : destination_country.country;
            
            const geocodedCoords = await geocodeAddress(addressToGeocode);
            if (geocodedCoords) {
              ipAddressToCoordinates[destination_ip] = geocodedCoords;
              cityCoordinatesCache.current[cacheKey] = geocodedCoords;
            } else {
              // Generate ocean coordinates for IPs without location
              ipAddressToCoordinates[destination_ip] = getGuaranteedOceanCoordinates();
            }
          }
        } else {
          // Generate ocean coordinates for IPs without location
          ipAddressToCoordinates[destination_ip] = getGuaranteedOceanCoordinates();
        }
      }
    }
    
    // Update the IP coordinates cache
    ipCoordinatesCache.current = ipAddressToCoordinates;
    
    // Now process the connections with consistent coordinates
    const processedData = [];
    
    for (const connection of ipData) {
      const { 
        source_ip, 
        destination_ip, 
        source_country, 
        destination_country
      } = connection;

      // Create a connection key
      const connectionKey = getConnectionKey(source_ip, destination_ip);

      // Skip if this connection is already being displayed
      if (activeConnections.current[connectionKey]) {
        // Update existing connection's timestamp to mark it as still active
        activeConnections.current[connectionKey].lastSeen = Date.now();
        continue;
      }

      // Use the consistent coordinates from our mapping
      const sourceCoordinates = ipAddressToCoordinates[source_ip];
      const destCoordinates = ipAddressToCoordinates[destination_ip];
      
      // Determine if source or destination is "No IP Info"
      const sourceIsNoIpInfo = source_country && source_country.country === "No IP Info";
      const destIsNoIpInfo = destination_country && destination_country.country === "No IP Info";

      // Calculate traffic level if not provided
      const trafficLevel: number = connection.total_byte || 0;

      // Determine condition based on traffic pattern
      let condition = null;
      if (trafficLevel > 1000) condition = 'High';
      else if (trafficLevel > 100) condition = 'Medium';
      else condition = 'Low';

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
        destIsNoIpInfo,
        connectionKey
      });
    }
    
    return processedData;
  }, [ipData, getGuaranteedOceanCoordinates]);

  const identifyHighPriorityConnections = useCallback(async () => {
    const ipConnections = await processIpData();
    if (!ipConnections || ipConnections.length === 0) return [];

    // Get top connections by traffic level
    return [...ipConnections]
      .sort((a, b) => b.trafficLevel - a.trafficLevel)
      .slice(0, Math.min(5, ipConnections.length));
  }, [processIpData]);

  
  useEffect(() => {
    const initPriorityConnections = async () => {
      priorityConnections.current = await identifyHighPriorityConnections();
    };
    
    initPriorityConnections();
  }, [identifyHighPriorityConnections]);


  
  const OCEAN_SOURCE_COORDINATE: [number, number] = [-20, -140]; // Pacific Ocean
  const OCEAN_DEST_COORDINATE: [number, number] = [30, -30];     // Atlantic Ocean

  useEffect(() => {
    const initializeMap = async () => {
      const mapInstance: any = L.map('map', {
        center: [20, 0], // Center on equator
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        zoomControl: false,
        worldCopyJump: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1.0,
      });
      
      // Disable all zoom interactions
      mapInstance.scrollWheelZoom.disable();
      mapInstance.doubleClickZoom.disable();
      mapInstance.touchZoom.disable();
      mapInstance.boxZoom.disable();
      mapInstance.keyboard.disable();
      // Add base tile layer
      L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stamen.com/">Stamen Maps</a>',
        maxZoom: 20,
      }).addTo(mapInstance);
      
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.style.zIndex = "-1";
      svg.innerHTML = `
        <defs>
          <pattern id="herringbone" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect x="0" y="0" width="4" height="4" fill="#ddd"/>
            <circle cx="2" cy="2" r="1" fill="#bbb"/>
          </pattern>
        </defs>
      `;
      document.body.appendChild(svg);
      // Add world borders
      const countries = await fetchGeoJSON(countriesGeoJSON);
      L.geoJSON(countries, {
        style: {
          fillColor: 'url(#herringbone)',
          weight: 1,
          opacity: 1,
          color: '#888',
          fillOpacity: 0.7,
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.name) {
            layer.bindTooltip(
              `<div style="font-weight:bold;font-size:13px;">${feature.properties.name}</div>`,
              { sticky: true, direction: 'top', className: 'custom-tooltip' }
            );
          }
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
          <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 0, 0, 0.7); border-radius:50%;"></span> High > 8000 KB</div>
          <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 165, 0, 0.7); border-radius:50%;"></span> Medium > 2000 - 8000 KB </div>
          <div><span style="display:inline-block; width:15px; height:15px; background:rgba(0, 128, 0, 0.7); border-radius:50%;"></span> Low < 2000 KB</div>
          <strong>IP</strong><br>
          <div><span style="display:inline-block; width:15px; height:15px; background:#00BFFF; border-radius:50%;"></span> Source IP</div>
          <div><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 165, 0, 0.7); border-radius:50%;"></span> Destination IP</div>
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

  const removedIpCache = useRef<Record<string, any>>({}); // Cache for removed IPs

  useEffect(() => {
    if (!map || isLoading) return;
  
    const loadAllConnections = async () => {
      const allConnections = await processIpData();
  
      let currentDataPoints: any = [];
  
      for (const conn of allConnections) {
        currentDataPoints = updateDataPoints(currentDataPoints, conn, removedIpCache);
      }
  
      // Remove all old markers and lines from the map and clear connectionElements
      Object.keys(connectionElements.current).forEach((key) => {
        const elementsArr = connectionElements.current[key];
        if (Array.isArray(elementsArr)) {
          elementsArr.forEach((elements) => {
            if (elements.sourceMarker) map.removeLayer(elements.sourceMarker);
            if (elements.destMarker) map.removeLayer(elements.destMarker);
            if (elements.flowLine) map.removeLayer(elements.flowLine);
          });
        } else if (elementsArr) {
          if (elementsArr.sourceMarker) map.removeLayer(elementsArr.sourceMarker);
          if (elementsArr.destMarker) map.removeLayer(elementsArr.destMarker);
          if (elementsArr.flowLine) map.removeLayer(elementsArr.flowLine);
        }
      });
      connectionElements.current = {};

      const usedCountries = new Set();

      currentDataPoints.forEach((conn: Record<string, any>) => {
        const hasSource = conn.source_country && conn.source_country.country && conn.source_country.country !== "No IP Info";
        const hasDest = conn.destination_country && conn.destination_country.country && conn.destination_country.country !== "No IP Info";

        let sourceCoordinates = null;
        let destinationCoordinates = null;
        let sourceLabel = conn.sourceIsNoIpInfo ? 'Ocean (No IP Info)' : conn.sourceLocation;
        let destLabel = conn.destIsNoIpInfo ? 'Ocean (No IP Info)' : conn.destinationLocation;

        // Always assign coordinates, even for ocean-to-ocean
        if (hasSource) {
          const aliasSource = COUNTRY_ALIASES[conn.source_country.country] || conn.source_country.country;
          sourceCoordinates = normalizeLatLng(highlightCountry(map, aliasSource));
          usedCountries.add(aliasSource);
        } else {
          sourceCoordinates = OCEAN_SOURCE_COORDINATE;
          L.marker(sourceCoordinates, {
            icon: L.divIcon({
              className: 'source-dot ocean-dot',
              html: `<div class="dot" style="background:${ORANGE}; width:8px; height:8px;"></div>`,
              iconSize: [8, 8],
              iconAnchor: [4, 4],
            }),
          })
            .addTo(map)
            .bindTooltip(
              `<div style="text-align: center;">
                <strong>Source (Ocean)</strong><br/>
                <span style="color: #000;">${conn.source_ip}</span><br/>
                No IP Info
              </div>`,
              {direction: 'top', className: 'custom-tooltip' }
            );
        }

        if (hasDest) {
          const aliasDest = COUNTRY_ALIASES[conn.destination_country.country] || conn.destination_country.country;
          destinationCoordinates = normalizeLatLng(highlightCountry(map, aliasDest));
          usedCountries.add(aliasDest);
        } else {
          destinationCoordinates = OCEAN_DEST_COORDINATE;
          L.marker(destinationCoordinates, {
            icon: L.divIcon({
              className: 'destination-dot ocean-dot dot-animated',
              html: `<div class="dot" style="background:${ORANGE}; width:16px; height:16px;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
          })
            .addTo(map)
            .bindTooltip(
              `<div style="text-align: center;">
                <strong>Destination (Ocean)</strong><br/>
                <span style="color: #000;"> ${conn.destination_ip}</span><br/>
                No IP Info
              </div>`,
              { direction: 'top', className: 'custom-tooltip' }
            );
        }

        // Draw markers for countries and ocean
        let sourceMarker = null;
        let destMarker = null;
        if (hasSource && sourceCoordinates) {
          sourceMarker = createSourceMarker(
            map,
            sourceCoordinates,
            sourceLabel,
            conn.trafficLevel,
            conn.source_ip
          );
        }
        if (hasDest && destinationCoordinates) {
          destMarker = createDestinationMarker(
            map,
            destinationCoordinates,
            destLabel,
            conn.trafficLevel,
            conn.destination_ip
          );
        }

        // Always draw the curve line if both coordinates are present (including ocean-to-ocean)
        if (
          Array.isArray(sourceCoordinates) && sourceCoordinates.length === 2 &&
          Array.isArray(destinationCoordinates) && destinationCoordinates.length === 2
        ) {
          const curvePoints: [number, number][] = [];
          const segments = 50;

          // Calculate distance between points to adjust curve strength
          const latDiff = Math.abs(sourceCoordinates[0] - destinationCoordinates[0]);
          const lngDiff = Math.abs(sourceCoordinates[1] - destinationCoordinates[1]);
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          const curveStrength = distance > 10 ? 2 : 0; // No curve for short hops

          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const lat =
              sourceCoordinates[0] * (1 - t) +
              destinationCoordinates[0] * t +
              Math.sin(Math.PI * t) * curveStrength;
            const lng =
              sourceCoordinates[1] * (1 - t) +
              destinationCoordinates[1] * t;
            curvePoints.push([lat, lng]);
          }
          // Ensure last point is exactly the destination
          curvePoints[curvePoints.length - 1] = [
            destinationCoordinates[0],
            destinationCoordinates[1],
          ];
          const flowLine: Record<string, any> = animateFlowLine(
            map,
            curvePoints,
            {
              color: getTrafficColor(conn.trafficLevel),
              weight: 3,
              opacity: 0.8,
              className: 'traffic-flow-line'
            }
          );

          // Store multiple lines per connectionKey
          const key = conn.connectionKey;
          if (!connectionElements.current[key]) {
            connectionElements.current[key] = [];
          }
          const lineObj = {
            sourceMarker,
            destMarker,
            flowLine,
            createdAt: Date.now(),
          };
          connectionElements.current[key].push(lineObj);

          // Fade out and remove after 2 seconds
          setTimeout(() => {
            if (flowLine && map.hasLayer(flowLine)) {
              if (flowLine?._path) {
                flowLine?._path.classList.add('fade-out');
              }
              setTimeout(() => {
                map.removeLayer(flowLine);
                // Remove from array
                const arr = connectionElements.current[key];
                if (arr) {
                  const idx = arr.indexOf(lineObj);
                  if (idx !== -1) arr.splice(idx, 1);
                  if (arr.length === 0) delete connectionElements.current[key];
                }
              }, 1000);
            }
          }, 2000);

          // If more than 3 lines for this connection, fade out and remove the oldest
          const arr = connectionElements.current[key];
          if (arr.length > 3) {
            const oldest = arr.shift();
            if (oldest && oldest.flowLine && map.hasLayer(oldest.flowLine)) {
              if (oldest.flowLine._path) {
                oldest.flowLine._path.classList.add('fade-out');
              }
              setTimeout(() => {
                map.removeLayer(oldest.flowLine);
                if (oldest.sourceMarker) map.removeLayer(oldest.sourceMarker);
                if (oldest.destMarker) map.removeLayer(oldest.destMarker);
              }, 1000);
            }
          }
        }
      });

      // Only remove highlights for countries NOT in usedCountries
      Object.keys(countryHighlights.current).forEach((country) => {
        if (!usedCountries.has(country)) {
          const { highlight, label } = countryHighlights.current[country];
          if (highlight) map.removeLayer(highlight);
          if (label) map.removeLayer(label);
          delete countryHighlights.current[country];
        }
      });

    };

    loadAllConnections();
  }, [map, isLoading, processIpData]);


  //   .traffic-flow-line {
  //   stroke-dasharray: none;
  //   stroke-dashoffset: 0;
  //   animation: none;
  // }
return (
    <>
      <style>
        {`
          .source-dot .dot, .destination-dot .dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            position: absolute;
            animation: emphasize-dot 1.5s infinite;
          }
          .ocean-dot .dot {
            width: 10px !important;
            height: 10px !important;
            animation: emphasize-dot-ocean 1.5s infinite;
          }
          @keyframes emphasize-dot {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.5), 0 0 0 0 rgba(255, 165, 0, 0.3);
            }
            70% {
              box-shadow: 0 0 0 8px rgba(255, 165, 0, 0), 0 0 0 16px rgba(255, 165, 0, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 165, 0, 0), 0 0 0 0 rgba(255, 165, 0, 0);
            }
          }
          @keyframes emphasize-dot-ocean {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.3);
            }
            70% {
              box-shadow: 0 0 0 5px rgba(255, 165, 0, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 165, 0, 0);
            }
          }
        
          .traffic-flow-line.fade-out {
            transition: opacity 1s linear;
            opacity: 0 !important;
          }

          .custom-tooltip {
            background-color: rgba(255, 255, 255, 0.9);
            /* border: 1px solid #ccc; */ /* Remove or comment out this line */
            border: none !important;
            border-radius: 4px;
            padding: 8px;
            font-family: geist, sans-serif;
            font-size: 12px;
            color: #333;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            max-width: 200px;
          }

          .custom-tooltip strong {
            color: #000; /* Ensure strong text is black */
          }

          .custom-tooltip span {
            color: #333; /* Ensure all text is dark gray */
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
            background: none; /* Remove background */
            border: none; /* Remove border */
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8); /* Optional: Add text shadow for better visibility */
            pointer-events: none; /* Prevent interaction with the label */
          }

          .country-name {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            background: none; /* Remove background */
            border: none; /* Remove border */
            text-align: center;
            white-space: nowrap; /* Prevent text wrapping */
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8); /* Optional: Add text shadow for better visibility */
            pointer-events: none; /* Prevent interaction with the label */
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

//tooltip - no label
// dot - same color
// blinking dot - bigger dot
