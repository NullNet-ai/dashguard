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

const MapComponent = ({ countryTrafficData, filterId }: Record<string, any>) => {
  const { ipData = [] } = countryTrafficData ?? {};
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cityCoordinatesCache: any = useRef({});
  const ipCoordinatesCache: any = useRef({}); // New cache to store IP-to-coordinates mappings
  const countriesGeoJSON: any = useRef(null);
  const countryHighlights: any = useRef({});
  const priorityConnections: any = useRef([]);
  const connectionElements: any = useRef({});
  const mapInstanceRef: any = useRef(null);
  const svgDefsElement: any = useRef(null);
  const trafficLayersRef: any = useRef(new Set());
  const drawSessionRef: any = useRef(0);
  const drawTimeoutsRef: any = useRef(new Set());

  const clearConnectionLayers = useCallback((mapInstance: any) => {
    if (!mapInstance) return;

    trafficLayersRef.current.forEach((layer: any) => {
      if (layer && mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });
    trafficLayersRef.current.clear();

    mapInstance.eachLayer((layer: any) => {
      const iconClassName = layer?.options?.icon?.options?.className;
      const layerClassName = layer?.options?.className;

      const isTrafficMarker =
        typeof iconClassName === 'string' &&
        (iconClassName.includes('source-dot') || iconClassName.includes('destination-dot'));

      const isTrafficLine =
        typeof layerClassName === 'string' && layerClassName.includes('traffic-flow-line');

      if (isTrafficMarker || isTrafficLine) {
        mapInstance.removeLayer(layer);
      }
    });

    Object.keys(connectionElements.current).forEach((key) => {
      const elementsArr = connectionElements.current[key];
      if (Array.isArray(elementsArr)) {
        elementsArr.forEach((elements) => {
          if (elements?.sourceMarker) mapInstance.removeLayer(elements.sourceMarker);
          if (elements?.destMarker) mapInstance.removeLayer(elements.destMarker);
          if (elements?.flowLine) mapInstance.removeLayer(elements.flowLine);
        });
      } else if (elementsArr) {
        if (elementsArr.sourceMarker) mapInstance.removeLayer(elementsArr.sourceMarker);
        if (elementsArr.destMarker) mapInstance.removeLayer(elementsArr.destMarker);
        if (elementsArr.flowLine) mapInstance.removeLayer(elementsArr.flowLine);
      }
    });

    connectionElements.current = {};
  }, []);

  const trackTrafficLayer = useCallback((layer: any) => {
    if (!layer) return;
    trafficLayersRef.current.add(layer);
  }, []);

  const clearDrawTimeouts = useCallback(() => {
    drawTimeoutsRef.current.forEach((timeoutId: any) => clearTimeout(timeoutId));
    drawTimeoutsRef.current.clear();
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, delayMs: number) => {
    const timeoutId: any = setTimeout(() => {
      drawTimeoutsRef.current.delete(timeoutId);
      fn();
    }, delayMs);
    drawTimeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const clearAllCountryHighlights = useCallback((mapInstance: any) => {
    if (!mapInstance) return;

    Object.keys(countryHighlights.current).forEach((country) => {
      const { highlight, label } = countryHighlights.current[country] || {};
      if (highlight) mapInstance.removeLayer(highlight);
      if (label) mapInstance.removeLayer(label);
    });

    countryHighlights.current = {};
  }, []);

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

      // Use the consistent coordinates from our mapping
      const sourceCoordinates = ipAddressToCoordinates[source_ip];
      const destCoordinates = ipAddressToCoordinates[destination_ip];
      
      // Determine if source or destination is "No IP Info"
      const sourceIsNoIpInfo = source_country && source_country.country === "No IP Info";
      const destIsNoIpInfo = destination_country && destination_country.country === "No IP Info";

      // Calculate traffic level if not provided
      const trafficLevel: number = Number(connection.total_byte) || 0;

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
      mapInstanceRef.current = mapInstance;
      
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
      svgDefsElement.current = svg;
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
      // @ts-expect-error - No type yet
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
      clearDrawTimeouts();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (svgDefsElement.current) {
        svgDefsElement.current.remove();
        svgDefsElement.current = null;
      }
    };
  }, []);

  const removedIpCache = useRef<Record<string, any>>({}); // Cache for removed IPs

  useEffect(() => {
    if (!map || isLoading) return;

    drawSessionRef.current += 1;
    clearDrawTimeouts();
    clearConnectionLayers(map);
    clearAllCountryHighlights(map);
    priorityConnections.current = [];
    removedIpCache.current = {};
  }, [filterId, map, isLoading, clearConnectionLayers, clearAllCountryHighlights, clearDrawTimeouts]);

  useEffect(() => {
    if (!map || isLoading) return;
  
    const loadAllConnections = async () => {
      const drawSession = drawSessionRef.current;
      const allConnections = await processIpData();
      if (drawSessionRef.current !== drawSession) return;
  
      let currentDataPoints: any = [];
  
      for (const conn of allConnections) {
        currentDataPoints = updateDataPoints(currentDataPoints, conn, removedIpCache);
      }

      currentDataPoints.forEach((conn: Record<string, any>) => {
        if (drawSessionRef.current !== drawSession) return;
        const hasSource = conn.source_country && conn.source_country.country && conn.source_country.country !== "No IP Info";
        const hasDest = conn.destination_country && conn.destination_country.country && conn.destination_country.country !== "No IP Info";

        let sourceCoordinates = null;
        let destinationCoordinates = null;
        let sourceLabel = conn.sourceIsNoIpInfo ? 'Ocean (No IP Info)' : conn.sourceLocation;
        let destLabel = conn.destIsNoIpInfo ? 'Ocean (No IP Info)' : conn.destinationLocation;
        let sourceMarker = null;
        let destMarker = null;

        // Always assign coordinates, even for ocean-to-ocean
        if (hasSource) {
          if (drawSessionRef.current !== drawSession) return;
          const aliasSource = COUNTRY_ALIASES[conn.source_country.country] || conn.source_country.country;
          sourceCoordinates = normalizeLatLng(highlightCountry(map, aliasSource));
        } else {
          if (drawSessionRef.current !== drawSession) return;
          sourceCoordinates = OCEAN_SOURCE_COORDINATE;
          sourceMarker = L.marker(sourceCoordinates, {
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
                No IP Info<br/>
                ${conn.trafficLevel > 1024 ? (conn.trafficLevel / 1024).toFixed(2) + ' KB' : conn.trafficLevel + ' bytes'} <br/>
              </div>`,
              {direction: 'top', className: 'custom-tooltip' }
            );
          trackTrafficLayer(sourceMarker);
        }

        if (hasDest) {
          if (drawSessionRef.current !== drawSession) return;
          const aliasDest = COUNTRY_ALIASES[conn.destination_country.country] || conn.destination_country.country;
          destinationCoordinates = normalizeLatLng(highlightCountry(map, aliasDest));
        } else {
          if (drawSessionRef.current !== drawSession) return;
          destinationCoordinates = OCEAN_DEST_COORDINATE;
          destMarker = L.marker(destinationCoordinates, {
            icon: L.divIcon({
              className: 'destination-dot ocean-dot dot-animated',
              html: `<div class="dot" style="background:${ORANGE}; width:8px; height:8px;"></div>`,
              iconSize: [8, 8],
              iconAnchor: [4, 4],
            }),
          })
            .addTo(map)
            .bindTooltip(
              `<div style="text-align: center;">
                <strong>Destination (Ocean)</strong><br/>
                <span style="color: #000;"> ${conn.destination_ip}</span><br/>
                No IP Info<br/>
                ${conn.trafficLevel > 1024 ? (conn.trafficLevel / 1024).toFixed(2) + ' KB' : conn.trafficLevel + ' bytes'} <br/>
              </div>`,
              { direction: 'top', className: 'custom-tooltip' }
            );
          trackTrafficLayer(destMarker);
        }

        // Draw markers for countries and ocean
        if (hasSource && sourceCoordinates && !sourceMarker) {
          if (drawSessionRef.current !== drawSession) return;
          sourceMarker = createSourceMarker(
            map,
            sourceCoordinates,
            sourceLabel,
            conn.trafficLevel,
            conn.source_ip
          );
          trackTrafficLayer(sourceMarker);
        }
        if (hasDest && destinationCoordinates && !destMarker) {
          if (drawSessionRef.current !== drawSession) return;
          destMarker = createDestinationMarker(
            map,
            destinationCoordinates,
            destLabel,
            conn.trafficLevel,
            conn.destination_ip
          );
          trackTrafficLayer(destMarker);
        }

        // Always draw the curve line if both coordinates are present (including ocean-to-ocean)
        if (
          Array.isArray(sourceCoordinates) && sourceCoordinates.length === 2 &&
          Array.isArray(destinationCoordinates) && destinationCoordinates.length === 2
        ) {
          if (drawSessionRef.current !== drawSession) return;
          const curvePoints: [number, number][] = [];
          const segments = 50;

          const sourceLat = sourceCoordinates[0];
          const sourceLng = sourceCoordinates[1];
          const destLat = destinationCoordinates[0];
          const destLng = destinationCoordinates[1];

          const sameCoordinates = sourceLat === destLat && sourceLng === destLng;

          let variant = Math.floor(Math.random() * 3);
          let direction = Math.random() < 0.5 ? -1 : 1;
          let curveStrength = 0;

          const midLat = (sourceLat + destLat) / 2;
          const midLng = (sourceLng + destLng) / 2;
          const dLat = destLat - sourceLat;
          const dLng = destLng - sourceLng;
          const lineLength = Math.sqrt(dLat * dLat + dLng * dLng) || 1;

          let controlLat = midLat;
          let controlLng = midLng;

          if (sameCoordinates) {
            variant = 2;
            direction = 1;

            const zoom = typeof map?.getZoom === 'function' ? map.getZoom() : 2;
            const radiusDeg = Math.min(12, Math.max(2, 12 / Math.max(1, zoom)));
            const sweepRad = Math.PI * 1.5;
            const centerAngle = Math.PI / 2;
            const startAngle = centerAngle - sweepRad / 2;
            const cosLat = Math.cos((sourceLat * Math.PI) / 180) || 1;

            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const r = Math.sin(Math.PI * t) * radiusDeg;
              const angle = startAngle + sweepRad * t;
              const lat = sourceLat + r * Math.sin(angle);
              const lng = sourceLng + (r * Math.cos(angle)) / Math.max(0.2, cosLat);
              curvePoints.push([lat, lng]);
            }
          } else {
            const latDiff = Math.abs(sourceLat - destLat);
            const lngDiff = Math.abs(sourceLng - destLng);
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
            const baseCurveStrength = distance > 10 ? 3 : 0;
            curveStrength =
              baseCurveStrength === 0 ? 0 : baseCurveStrength * (0.9 + Math.random() * 0.9);

            const perpLat = (-dLng / lineLength) * curveStrength * 1.6 * direction;
            const perpLng = (dLat / lineLength) * curveStrength * 1.6 * direction;
            controlLat = midLat + perpLat;
            controlLng = midLng + perpLng;

            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const inv = 1 - t;

              let lat = sourceLat * inv + destLat * t;
              let lng = sourceLng * inv + destLng * t;

              if (variant === 0) {
                lat += Math.sin(Math.PI * t) * curveStrength * direction;
              } else if (variant === 1) {
                lng += Math.sin(Math.PI * t) * curveStrength * direction;
              } else {
                lat =
                  inv * inv * sourceLat + 2 * inv * t * controlLat + t * t * destLat;
                lng =
                  inv * inv * sourceLng + 2 * inv * t * controlLng + t * t * destLng;
              }
              curvePoints.push([lat, lng]);
            }
          }
          curvePoints[curvePoints.length - 1] = [
            destinationCoordinates[0],
            destinationCoordinates[1],
          ];

          const animationStartDelayMs =
            variant * 200 + (direction === 1 ? 0 : 110) + Math.floor(Math.random() * 280);
          const animationFrameDelayMs = 22 + Math.floor(Math.random() * 18);
          const animationStep = 1 + Math.floor(Math.random() * 2);

          const flowLine: Record<string, any> = animateFlowLine(
            map,
            curvePoints,
            {
              color: getTrafficColor(conn.trafficLevel),
              weight: 3,
              opacity: 0.8,
              className: 'traffic-flow-line',
              animationStartDelayMs,
              animationFrameDelayMs,
              animationStep,
              onAnimationEnd: () => {
                const removeElements = () => {
                  if (flowLine && map.hasLayer(flowLine)) map.removeLayer(flowLine);
                  if (sourceMarker && map.hasLayer(sourceMarker)) map.removeLayer(sourceMarker);
                  if (destMarker && map.hasLayer(destMarker)) map.removeLayer(destMarker);

                  if (flowLine) trafficLayersRef.current.delete(flowLine);
                  if (sourceMarker) trafficLayersRef.current.delete(sourceMarker);
                  if (destMarker) trafficLayersRef.current.delete(destMarker);

                  const arr = connectionElements.current[key];
                  if (arr) {
                    const idx = arr.indexOf(lineObj);
                    if (idx !== -1) arr.splice(idx, 1);
                    if (arr.length === 0) delete connectionElements.current[key];
                  }
                };

                if (drawSessionRef.current !== drawSession) {
                  removeElements();
                  return;
                }

                if (flowLine?._path) {
                  flowLine._path.classList.add('fade-out');
                }
                scheduleTimeout(removeElements, 1000);
              },
            }
          );
          trackTrafficLayer(flowLine);

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
        }
      });

    };

    loadAllConnections();
  }, [map, isLoading, processIpData, filterId, trackTrafficLayer, scheduleTimeout]);


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
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: absolute;
            animation: emphasize-dot 1.5s infinite;
          }
          .ocean-dot .dot {
            width: 8px !important;
            height: 8px !important;
            animation: emphasize-dot-ocean 1.5s infinite;
          }
          @keyframes emphasize-dot {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.5), 0 0 0 0 rgba(255, 165, 0, 0.3);
            }
            70% {
              box-shadow: 0 0 0 2px rgba(255, 165, 0, 0), 0 0 0 4px rgba(255, 165, 0, 0);
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
              box-shadow: 0 0 0 4px rgba(255, 165, 0, 0);
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
