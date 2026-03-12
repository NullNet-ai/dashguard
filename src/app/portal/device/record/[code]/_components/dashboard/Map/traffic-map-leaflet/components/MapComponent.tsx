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
import { createSourceDestinationMarker, ORANGE } from '../functions/createMarker'

const chaikinSmooth = (points: [number, number][], iterations: number) => {
  let current = points
  const steps = Math.max(0, Math.floor(iterations))

  for (let k = 0; k < steps; k++) {
    if (!Array.isArray(current) || current.length < 3) return current

    const first = current[0]
    if (!first) return current
    const next: [number, number][] = [first]
    for (let i = 0; i < current.length - 1; i++) {
      const p1 = current[i]
      const p2 = current[i + 1]
      if (!p1 || !p2) continue
      const [lat1, lng1] = p1
      const [lat2, lng2] = p2

      next.push(
        [0.75 * lat1 + 0.25 * lat2, 0.75 * lng1 + 0.25 * lng2],
        [0.25 * lat1 + 0.75 * lat2, 0.25 * lng1 + 0.75 * lng2],
      )
    }
    const last = current[current.length - 1]
    if (last) next.push(last)
    current = next
  }

  return current
}

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
  const markerUsageRef = useRef<Record<string, { marker: any; count: number }>>({});
  const latestActiveCountriesRef = useRef<Set<string>>(new Set());
  const resizeObserverRef: any = useRef(null);
  const resizeHandlerRef: any = useRef(null);

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
    markerUsageRef.current = {};
  }, []);

  const acquireMarker = useCallback(
    (markerKey: string, createMarker: () => any) => {
      const existing = markerUsageRef.current[markerKey];
      if (existing?.marker && map?.hasLayer?.(existing.marker)) {
        existing.count += 1;
        return existing.marker;
      }

      const marker = createMarker();
      markerUsageRef.current[markerKey] = { marker, count: 1 };
      return marker;
    },
    [map],
  );

  const releaseMarker = useCallback(
    (markerKey?: string | null) => {
      if (!markerKey) return;
      const entry = markerUsageRef.current[markerKey];
      if (!entry) return;

      entry.count -= 1;
      if (entry.count > 0) return;

      if (entry.marker && map?.hasLayer?.(entry.marker)) {
        map.removeLayer(entry.marker);
      }
      if (entry.marker) {
        trafficLayersRef.current.delete(entry.marker);
      }
      delete markerUsageRef.current[markerKey];
    },
    [map],
  );

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

  const normalizeCountryKey = useCallback((rawCountry: any) => {
    if (typeof rawCountry !== 'string') return null;
    let current = rawCountry.trim();
    if (!current) return null;

    for (let i = 0; i < 5; i++) {
      const next = COUNTRY_ALIASES[current] || current;
      if (next === current) break;
      current = next;
    }

    return current;
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

  const getInFlightCountries = useCallback((mapInstance: any) => {
    const inFlight = new Set<string>();
    if (!mapInstance) return inFlight;

    Object.values(connectionElements.current).forEach((value: any) => {
      const items = Array.isArray(value) ? value : value ? [value] : [];
      items.forEach((item: any) => {
        const flowLine = item?.flowLine;
        if (!flowLine || !mapInstance?.hasLayer?.(flowLine)) return;
        const sourceCountryKey = item?.sourceCountryKey;
        const destCountryKey = item?.destCountryKey;
        if (typeof sourceCountryKey === 'string' && sourceCountryKey) inFlight.add(sourceCountryKey);
        if (typeof destCountryKey === 'string' && destCountryKey) inFlight.add(destCountryKey);
      });
    });

    return inFlight;
  }, []);

  const pruneCountryHighlights = useCallback(
    (mapInstance: any, activeCountries: Set<string>) => {
      if (!mapInstance) return;

      const inFlightCountries = getInFlightCountries(mapInstance);

      Object.keys(countryHighlights.current).forEach((countryKey) => {
        if (activeCountries.has(countryKey)) return;
        if (inFlightCountries.has(countryKey)) return;
        const { highlight, label } = countryHighlights.current[countryKey] || {};
        if (highlight && mapInstance.hasLayer(highlight)) mapInstance.removeLayer(highlight);
        if (label && mapInstance.hasLayer(label)) mapInstance.removeLayer(label);
      });
    },
    [getInFlightCountries],
  );

  const hasAnyTrafficLayers = useCallback((mapInstance: any, excludeLayers?: Set<any>) => {
    if (!mapInstance || typeof mapInstance.eachLayer !== 'function') return false;

    let found = false;
    mapInstance.eachLayer((layer: any) => {
      if (found) return;
      if (excludeLayers && excludeLayers.has(layer)) return;

      const iconClassName = layer?.options?.icon?.options?.className;
      const layerClassName = layer?.options?.className;

      const isTrafficMarker =
        typeof iconClassName === 'string' &&
        (iconClassName.includes('source-dot') || iconClassName.includes('destination-dot'));

      const isTrafficLine =
        typeof layerClassName === 'string' && layerClassName.includes('traffic-flow-line');

      if (isTrafficMarker || isTrafficLine) {
        found = true;
      }
    });

    return found;
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
        minZoom: 1,
        maxZoom: 8,
        zoomControl: false,
        worldCopyJump: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1.0,
      });
      mapInstanceRef.current = mapInstance;
      
      const mapEl = document.getElementById('map');
      const onResize = () => {
        try { mapInstance.invalidateSize(); } catch {}
      };
      if (mapEl && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(() => onResize());
        ro.observe(mapEl);
        resizeObserverRef.current = ro;
      }
      window.addEventListener('resize', onResize);
      resizeHandlerRef.current = onResize;

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
    
    const addLegend = (mapInstance: any) => {
      const legend = (L as any).control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
          <div style="background: white; padding: 0; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.4); overflow: hidden; transition: width 200ms ease;">
            <div class="legend-header" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px; cursor:pointer; user-select:none;">
              <strong style="font-weight:600;">Legend</strong>
              <span class="legend-arrow" style="display:inline-flex; width:14px; height:14px; transition: transform 200ms ease; transform: rotate(180deg); align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
            <div class="legend-body" style="padding:10px; border-top:1px solid #eee; transition:max-height 200ms ease, opacity 200ms ease; max-height:1000px; opacity:1; overflow:hidden;">
              <div style="margin-bottom:8px;"><strong>Traffic Intensity</strong></div>
              <div style="margin-bottom:4px;"><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 0, 0, 0.7); border-radius:50%; vertical-align:middle; margin-right:6px;"></span> Heavy > 8000 KB</div>
              <div style="margin-bottom:4px;"><span style="display:inline-block; width:15px; height:15px; background:rgba(255, 165, 0, 0.7); border-radius:50%; vertical-align:middle; margin-right:6px;"></span> Busy > 2000 - 8000 KB </div>
              <div style="margin-bottom:8px;"><span style="display:inline-block; width:15px; height:15px; background:rgba(0, 128, 0, 0.7); border-radius:50%; vertical-align:middle; margin-right:6px;"></span> Low < 2000 KB</div>
            </div>
          </div>
        `;
        return div;
      };
      legend.addTo(mapInstance);
      const container = legend.getContainer();
      const panel = container?.firstElementChild as HTMLElement | null;
      const header = container?.querySelector('.legend-header') as HTMLElement | null;
      const body = container?.querySelector('.legend-body') as HTMLElement | null;
      const arrow = container?.querySelector('.legend-arrow') as HTMLElement | null;
      let expanded = true;
      if (body) body.style.maxHeight = body.scrollHeight + 'px';
      if (header) {
        L.DomEvent.on(header, 'click', (e: any) => {
          L.DomEvent.stop(e);
          expanded = !expanded;
          if (body) {
            if (expanded) {
              body.style.opacity = '1';
              body.style.padding = '10px';
              if (panel) panel.style.width = 'auto';
              requestAnimationFrame(() => {
                body.style.maxHeight = body.scrollHeight + 'px';
              });
            } else {
              body.style.maxHeight = '0px';
              body.style.opacity = '0';
              body.style.padding = '0';
              if (panel) panel.style.width = 'min-content';
            }
          }
          if (arrow) {
            arrow.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        });
      }
    };
    
    initializeMap().catch(console.error);
    
    return () => {
      clearDrawTimeouts();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (resizeObserverRef.current?.disconnect) resizeObserverRef.current.disconnect();
      if (resizeHandlerRef.current) window.removeEventListener('resize', resizeHandlerRef.current);
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

      const activeCountries = new Set<string>();
      currentDataPoints.forEach((conn: Record<string, any>) => {
        const sourceCountry = conn?.source_country?.country;
        const destCountry = conn?.destination_country?.country;

        const normalizedSource = normalizeCountryKey(sourceCountry);
        if (normalizedSource && normalizedSource !== 'No IP Info') activeCountries.add(normalizedSource);

        const normalizedDest = normalizeCountryKey(destCountry);
        if (normalizedDest && normalizedDest !== 'No IP Info') activeCountries.add(normalizedDest);
      });
      latestActiveCountriesRef.current = activeCountries;
      pruneCountryHighlights(map, activeCountries);

      currentDataPoints.forEach((conn: Record<string, any>) => {
        if (drawSessionRef.current !== drawSession) return;
        const hasSource = conn.source_country && conn.source_country.country && conn.source_country.country !== "No IP Info";
        const hasDest = conn.destination_country && conn.destination_country.country && conn.destination_country.country !== "No IP Info";

        let sourceCoordinates: [number, number] | null = null;
        let destinationCoordinates: [number, number] | null = null;
        let sourceLabel = conn.sourceIsNoIpInfo ? 'Ocean (No IP Info)' : conn.sourceLocation;
        let destLabel = conn.destIsNoIpInfo ? 'Ocean (No IP Info)' : conn.destinationLocation;
        let sourceMarker = null;
        let destMarker = null;
        let sourceMarkerKey: string | null = null;
        let destMarkerKey: string | null = null;
        let sourceCountryKey: string | null = null;
        let destCountryKey: string | null = null;

        // Always assign coordinates, even for ocean-to-ocean
        if (hasSource) {
          if (drawSessionRef.current !== drawSession) return;
          const resolvedSourceCountryKey =
            normalizeCountryKey(conn.source_country.country) || String(conn.source_country.country).trim();
          sourceCountryKey = resolvedSourceCountryKey;
          sourceCoordinates = normalizeLatLng(highlightCountry(map, resolvedSourceCountryKey));
        } else {
          if (drawSessionRef.current !== drawSession) return;
          sourceCoordinates = OCEAN_SOURCE_COORDINATE;
          sourceMarkerKey = `source:${conn.source_ip ?? ''}:${conn.destination_ip ?? ''}`;
          sourceMarker = acquireMarker(sourceMarkerKey, () =>
            L.marker(sourceCoordinates as [number, number], {
              icon: L.divIcon({
                className: 'source-dot ocean-dot',
                html: `<div class="traffic-pulse-marker" style="--pulse-color:${ORANGE}"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
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
              )
          );
          trackTrafficLayer(sourceMarker);
        }

        if (hasDest) {
          if (drawSessionRef.current !== drawSession) return;
          const resolvedDestCountryKey =
            normalizeCountryKey(conn.destination_country.country) || String(conn.destination_country.country).trim();
          destCountryKey = resolvedDestCountryKey;
          destinationCoordinates = normalizeLatLng(highlightCountry(map, resolvedDestCountryKey));
        } else {
          if (drawSessionRef.current !== drawSession) return;
          destinationCoordinates = OCEAN_DEST_COORDINATE;
          destMarkerKey = `destination:${conn.destination_ip ?? ''}:${conn.source_ip ?? ''}`;
          destMarker = acquireMarker(destMarkerKey, () =>
            L.marker(destinationCoordinates as [number, number], {
              icon: L.divIcon({
                className: 'destination-dot ocean-dot',
                html: `<div class="traffic-pulse-marker" style="--pulse-color:${ORANGE}"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
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
              )
          );
          trackTrafficLayer(destMarker);
        }

        // Draw markers for countries and ocean

        if (hasSource && sourceCoordinates && !sourceMarker) {
          if (drawSessionRef.current !== drawSession) return;
          sourceMarkerKey = `source:${conn.source_ip ?? ''}:${conn.destination_ip ?? ''}`;
          sourceMarker = acquireMarker(sourceMarkerKey, () =>
            createSourceDestinationMarker(
              map,
              sourceCoordinates,
              sourceLabel,
              destLabel,
              conn.trafficLevel,
              conn.source_ip,
              conn.destination_ip
            )
          );
          trackTrafficLayer(sourceMarker);
        }

        // if (hasDest && destinationCoordinates && !destMarker) {
        //   if (drawSessionRef.current !== drawSession) return;
        //   destMarkerKey = `destination:${conn.destination_ip ?? ''}:${conn.source_ip ?? ''}`;
        //   destMarker = acquireMarker(destMarkerKey, () =>
        //     createSourceDestinationMarker(
        //       map,
        //       destinationCoordinates,
        //       sourceLabel,
        //       destLabel,
        //       conn.trafficLevel,
        //       conn.source_ip,
        //       conn.destination_ip
        //     )
        //   );
        //   trackTrafficLayer(destMarker);
        // }

        // Always draw the curve line if both coordinates are present (including ocean-to-ocean)
        if (
          Array.isArray(sourceCoordinates) && sourceCoordinates.length === 2 &&
          Array.isArray(destinationCoordinates) && destinationCoordinates.length === 2
        ) {
          if (drawSessionRef.current !== drawSession) return;
          const curvePoints: [number, number][] = [];
          const zoom = typeof map?.getZoom === 'function' ? map.getZoom() : 2;
          const segments = Math.min(180, Math.max(60, Math.round(zoom * 18)));

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
            variant = Math.floor(Math.random() * 3);
            direction = 1;

            const sizeFactor = variant === 0 ? 0.7 : variant === 1 ? 1 : 1.35;
            const cosLat = Math.cos((sourceLat * Math.PI) / 180) || 1;
            const cosLatSafe = Math.max(0.2, cosLat);

            const baseHeightDeg = 18 / Math.max(1, zoom);
            const baseWidthDeg = 6 / Math.max(0.8, zoom);
            const heightDeg = Math.min(22, Math.max(2.0, baseHeightDeg * sizeFactor));
            const widthDeg = Math.min(14, Math.max(1.2, baseWidthDeg * sizeFactor));

            let radius = Math.min(widthDeg * 1.1, heightDeg * 0.45);
            let d = heightDeg - radius;
            if (d <= radius * 1.05) {
              radius = heightDeg / 2.2;
              d = heightDeg - radius;
            }

            const alpha = Math.asin(Math.min(0.98, radius / Math.max(0.001, d)));
            const tangentY = d - (radius * radius) / Math.max(0.001, d);
            const tangentX = radius * Math.cos(alpha);

            const lineSegments = Math.min(220, Math.max(60, Math.round(segments * 1.1)));
            const arcSegments = Math.min(520, Math.max(160, Math.round(segments * 3.6)));

            curvePoints.push([sourceLat, sourceLng]);

            for (let i = 1; i <= lineSegments; i++) {
              const t = i / lineSegments;
              const x = -tangentX * t;
              const y = tangentY * t;
              const lat = sourceLat + y;
              const lng = sourceLng + x / cosLatSafe;
              curvePoints.push([lat, lng]);
            }

            for (let i = 1; i <= arcSegments; i++) {
              const t = i / arcSegments;
              const angle = (Math.PI + alpha) - t * (Math.PI + 2 * alpha);
              const x = radius * Math.cos(angle);
              const y = d + radius * Math.sin(angle);
              const lat = sourceLat + y;
              const lng = sourceLng + x / cosLatSafe;
              curvePoints.push([lat, lng]);
            }

            for (let i = 1; i <= lineSegments; i++) {
              const t = i / lineSegments;
              const x = tangentX * (1 - t);
              const y = tangentY * (1 - t);
              const lat = sourceLat + y;
              const lng = sourceLng + x / cosLatSafe;
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

          const pointsForLine = curvePoints

          const targetAnimationDurationMs = 1000
          const sameCoordinatesFrameDelayMs = 16
          const sameCoordinatesFrames = Math.max(
            1,
            Math.round(targetAnimationDurationMs / sameCoordinatesFrameDelayMs),
          )
          const sameCoordinatesStep = Math.max(
            1,
            Math.ceil(pointsForLine.length / sameCoordinatesFrames),
          )

          const animationStartDelayMs =
            variant * 200 + (direction === 1 ? 0 : 110) + Math.floor(Math.random() * 280);
          const animationFrameDelayMs = sameCoordinates
            ? sameCoordinatesFrameDelayMs
            : 22 + Math.floor(Math.random() * 18);
          const animationStep = sameCoordinates ? sameCoordinatesStep : 1 + Math.floor(Math.random() * 2);

          const flowLine: Record<string, any> = animateFlowLine(
            map,
            pointsForLine,
            {
              color: getTrafficColor(conn.trafficLevel),
              weight: 3,
              opacity: 0.8,
              className: 'traffic-flow-line',
              lineCap: 'round',
              lineJoin: 'round',
              smoothFactor: 0,
              animationStartDelayMs,
              animationFrameDelayMs,
              animationStep,
              onAnimationEnd: () => {
                const removeElements = () => {
                  if (flowLine && map.hasLayer(flowLine)) map.removeLayer(flowLine);
                  if (flowLine) trafficLayersRef.current.delete(flowLine);
                  releaseMarker(sourceMarkerKey);
                  releaseMarker(destMarkerKey);

                  const arr = connectionElements.current[key];
                  if (arr) {
                    const idx = arr.indexOf(lineObj);
                    if (idx !== -1) arr.splice(idx, 1);
                    if (arr.length === 0) delete connectionElements.current[key];
                  }

                  pruneCountryHighlights(map, latestActiveCountriesRef.current);

                  if (!hasAnyTrafficLayers(map)) {
                    clearAllCountryHighlights(map);
                  }
                };

                if (drawSessionRef.current !== drawSession) {
                  removeElements();
                  return;
                }

                const excluded = new Set<any>();
                if (flowLine) excluded.add(flowLine);
                if (sourceMarker) excluded.add(sourceMarker);
                if (destMarker) excluded.add(destMarker);

                if (!hasAnyTrafficLayers(map, excluded)) {
                  clearAllCountryHighlights(map);
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
            sourceCountryKey,
            destCountryKey,
          };
          connectionElements.current[key].push(lineObj);
        }
      });

    };

    loadAllConnections();
  }, [map, isLoading, processIpData, filterId, trackTrafficLayer, scheduleTimeout, clearAllCountryHighlights, pruneCountryHighlights, normalizeCountryKey, hasAnyTrafficLayers, acquireMarker, releaseMarker]);


  //   .traffic-flow-line {
  //   stroke-dasharray: none;
  //   stroke-dashoffset: 0;
  //   animation: none;
  // }
return (
    <>
      <style>
        {`
          path.leaflet-interactive:focus {
            outline: none !important;
          }

          .source-dot.leaflet-div-icon,
          .destination-dot.leaflet-div-icon {
            background: transparent;
            border: none;
          }

          .traffic-pulse-marker {
            position: relative;
            width: 24px;
            height: 24px;
          }

          .traffic-pulse-marker::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: var(--pulse-color, rgba(255, 165, 0, 1));
            transform: translate(-50%, -50%);
            box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.18), 0 0 10px rgba(255, 165, 0, 0.35);
          }

          .traffic-pulse-marker::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            border: 2px solid rgba(255, 165, 0, 0.55);
            transform: translate(-50%, -50%);
            animation: traffic-marker-pulse 1.6s ease-out infinite;
          }

          @keyframes traffic-marker-pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.85;
            }
            70% {
              transform: translate(-50%, -50%) scale(4.2);
              opacity: 0;
            }
            100% {
              transform: translate(-50%, -50%) scale(4.2);
              opacity: 0;
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
            min-width: max-content;
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
      <div id="map" style={{ height: 'calc(-145px + 100vh)', width: '100%', backgroundColor: 'white' }} />
      
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
