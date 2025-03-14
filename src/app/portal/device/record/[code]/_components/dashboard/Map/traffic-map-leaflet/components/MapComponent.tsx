'use client';

import { useEffect } from 'react';
import L, {  LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-arc';

// Function to fetch country and US state borders
const fetchCountryBorders = async () => {
  const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
  return await response.json();
};

const fetchUSStatesBorders = async () => {
  const response = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
  return await response.json();
};

// Function to get coordinates of a city
const geocodeAddress = async (address: any) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } else {
      console.error(`Address "${address}" not found.`);
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Traffic data with city-level coordinates
const trafficData = {
  'United Kingdom': { city: 'London, UK', trafficLevel: 75 },
  'United States of America': { city: 'New York, USA', trafficLevel: 85 },
  'Japan': { city: 'Tokyo, Japan', trafficLevel: 30 },
  'Germany': { city: 'Berlin, Germany', trafficLevel: 50 },
  'Canada': { city: 'Toronto, Canada', trafficLevel: 40 },
  'China': { city: 'Beijing, China', trafficLevel: 95 },
  'Brazil': { city: 'São Paulo, Brazil', trafficLevel: 55 },
  'South Korea': { city: 'Seoul, South Korea', trafficLevel: 35 },
} as any;

// Additional city connections that don't correspond to countries in trafficData
const additionalCityConnections = [
  { city: 'Singapore, Singapore', trafficLevel: 60 },
  { city: 'Dublin, Ireland', trafficLevel: 45 },
  { city: 'Dubai, UAE', trafficLevel: 70 },
  { city: 'Wellington, New Zealand', trafficLevel: 15 },
  { city: 'Vienna, Austria', trafficLevel: 40 },
  { city: 'Helsinki, Finland', trafficLevel: 30 },
  { city: 'Prague, Czech Republic', trafficLevel: 35 },
  { city: 'Kuala Lumpur, Malaysia', trafficLevel: 55 },
];

// Region to region connections
const regionToRegionConnections = [
  { toRegion: 'Ontario, Canada', trafficLevel: 65, condition: 'High Latency' },
  { toRegion: 'Bavaria, Germany', trafficLevel: 55, condition: 'Low Bandwidth' },
  { toRegion: 'Seoul, South Korea', trafficLevel: 40, condition: 'Normal' },
  { toRegion: 'Mumbai, India', trafficLevel: 85, condition: 'Congested' },
  { toRegion: 'Île-de-France, France', trafficLevel: 30, condition: 'Optimized' },
];


// Region to city connections
const regionToCityConnections = [
  { fromRegion: 'United Kingdom', toCity: 'Dubai, UAE', trafficLevel: 50, condition: 'Stable' },
  { fromRegion: 'United States of America', toCity: 'Singapore, Singapore', trafficLevel: 75, condition: 'Congested' },
  { fromRegion: 'Japan', toCity: 'Kuala Lumpur, Malaysia', trafficLevel: 45, condition: 'Normal' },
  { fromRegion: 'Germany', toCity: 'Prague, Czech Republic', trafficLevel: 35, condition: 'Low Bandwidth' },
];

// City to city connections
const cityToCityConnections = [
  { fromCity: 'Singapore, Singapore', toCity: 'Dubai, UAE', trafficLevel: 55, condition: 'High Latency' },
  { fromCity: 'Dublin, Ireland', toCity: 'Helsinki, Finland', trafficLevel: 30, condition: 'Normal' },
  { fromCity: 'Vienna, Austria', toCity: 'Prague, Czech Republic', trafficLevel: 25, condition: 'Optimized' },
];

// Function to determine traffic color
const getTrafficColor = (trafficLevel: number) => {
  if (trafficLevel > 80) return "rgba(255, 0, 0, 0.7)"; // 🔴 Very High
  if (trafficLevel >= 50) return "rgba(255, 165, 0, 0.7)"; // 🟠 High
  if (trafficLevel >= 30) return "rgba(255, 255, 0, 0.7)"; // 🟡 Medium
  return "rgba(0, 128, 0, 0.7)"; // 🟢 Low
};

// Function to get color for connection condition
const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'Congested': return "rgba(255, 0, 0, 0.7)";      // Red
    case 'High Latency': return "rgba(255, 0, 255, 0.7)"; // Purple
    case 'Low Bandwidth': return "rgba(255, 165, 0, 0.7)"; // Orange
    case 'Normal': return "rgba(255, 255, 0, 0.7)";       // Yellow
    case 'Stable': return "rgba(0, 191, 255, 0.7)";       // Light Blue
    case 'Optimized': return "rgba(0, 128, 0, 0.7)";      // Green
    default: return "rgba(128, 128, 128, 0.7)";           // Gray
  }
};

// Function to create a **curved** traffic flow line using Bezier curves
const createCurvedFlowLine = (fromCoord: Record<string,any>, toCoord: Record<string,any>, trafficLevel: number, name: string, condition = null) => {
  if (!fromCoord || !toCoord) {
    console.error(`Missing coordinates for connection: ${name}`);
    return null;
  }

  const curvePoints: any = [];
  const segments = 50; // Higher = smoother curve

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = fromCoord[1] * (1 - t) + toCoord[1] * t;
    const y =
      fromCoord[0] * (1 - t) +
      toCoord[0] * t +
      Math.sin(Math.PI * t) * 20; // Adjust curve height

    curvePoints.push([y, x]);
  }

  // Use condition color if provided, otherwise use traffic level color
  const lineColor = condition ? getConditionColor(condition) : getTrafficColor(trafficLevel);

  return L.polyline(curvePoints, {
    color: lineColor,
    weight: Math.max(3, trafficLevel / 20),
    opacity: 0.8,
    dashArray: '5, 5', // Dotted curve
  });
};

const MapComponent = () => {
  const fn = async () => {
    const map = L.map('map', {
      center: [14.5995, 120.9842],
      zoom: 3,
      minZoom: 3,
      maxZoom: 8,
      worldCopyJump: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
    });
    
    // Get coordinates for countries in trafficData
    const cityCoordinates: any = {};
    const countryCoordinates: any = {};
    
    
    for (const country in trafficData) {
      cityCoordinates[country] = await geocodeAddress(trafficData[country].city);
      console.log("%c Coordinates for:", "color:#4fff4B", trafficData[country].city, cityCoordinates[country]);
      
      // Also get coordinates for the country center (for region-to-region connections)
      countryCoordinates[country] = await geocodeAddress(country);
      console.log("%c Country coordinates:", "color:#4fff4B", country, countryCoordinates[country]);
    }
    
    // Get coordinates for additional cities
    const additionalCityCoordinates: any = {};
    for (const cityData of additionalCityConnections) {
      additionalCityCoordinates[cityData.city] = await geocodeAddress(cityData.city);
      console.log("%c Additional city coordinates:", "color:#4fff4B", cityData.city, additionalCityCoordinates[cityData.city]);
    }
    
    // Get coordinates for region to region connection
    const regionCoordinates: any = {};
    for (const regionData of regionToRegionConnections) {
      // Fix: Fetch coordinates for each region and ensure we have valid data
      const coords = await geocodeAddress(regionData.toRegion);
      if (coords) {
        regionCoordinates[regionData.toRegion] = coords;
        console.log("%c Region coordinates:", "color:#4fff4B", regionData.toRegion, coords);
      } else {
        console.error(`Failed to get coordinates for region: ${regionData.toRegion}`);
      }
    }
    
    const philippinesCoordinates: any = await geocodeAddress('Manila, Philippines');

    L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://stamen.com/">Stamen Maps</a>',
      maxZoom: 20,
    }).addTo(map);

    const [countries, states] = await Promise.all([fetchCountryBorders(), fetchUSStatesBorders()]);
    const geojson = { ...countries, features: [...countries.features, ...states.features] };

    // Add tooltips to regions
    const countryLayers: Record<string,any> = {};
    L.geoJSON(geojson, {
      style: (feature) => {
        const countryName = feature?.properties.name;
        const trafficLevel = trafficData[countryName]?.trafficLevel;

        return {
          fillColor: trafficLevel ? getTrafficColor(trafficLevel) : 'transparent',
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: trafficLevel ? 0.4 : 0.1,
        };
      },
      onEachFeature: (feature, layer) => {
        const countryName = feature.properties.name;
        const trafficLevel = trafficData[countryName]?.trafficLevel;
        
        // Store the layer for later reference
        countryLayers[countryName] = layer;
    
        if (trafficLevel) {
          // Add country label
          const center = (layer as any)?.getBounds().getCenter();
          const label = L.divIcon({
            className: 'country-label',
            html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .8em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${countryName.toUpperCase()}</div>`,
          });
          L.marker(center, { icon: label }).addTo(map);

          // Add tooltip to the region
          layer.bindTooltip(
            `<div style="text-align: center;">
              <strong>${countryName}</strong><br/>
              Traffic Level: ${trafficLevel}%
            </div>`,
            { 
              permanent: false,
              direction: 'auto',
              className: 'custom-tooltip'
            }
          );
        }
      },
    }).addTo(map);

    // Function to create a city marker with circle and label
    const createCityMarker = (coordinates: LatLngExpression, name: string, trafficLevel: number, cityName = null) => {
      if (!coordinates) {
        console.error(`Missing coordinates for city/region: ${cityName || name}`);
        return null;
      }
      
      // Create the twinkling dot
      const dotColor = getTrafficColor(trafficLevel);
      const divIcon = L.divIcon({
        className: 'twinkling-dot',
        html: `<div class="dot" style="background:${dotColor};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker(coordinates, { icon: divIcon }).addTo(map);
      
      // Add colored circle around the dot
      const circle = L.circle(coordinates, {
        color: dotColor,
        fillColor: dotColor,
        fillOpacity: 0.2,
        radius: 100000, // Adjust radius as needed (in meters)
        weight: 1
      }).addTo(map);
      
      // Add city label - with black color and all uppercase
      const displayCityName: any = cityName || name;
      const cityLabel = displayCityName?.split(',')[0].toUpperCase(); // Extract just the city name before the comma and convert to uppercase
      
      const cityLabelIcon = L.divIcon({
        className: 'city-label',
        html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .7em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${cityLabel}</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, -10], // Position label above the dot
      });
      L.marker(coordinates, { icon: cityLabelIcon }).addTo(map);
      
      // Add tooltip to the marker
      marker.bindTooltip(
        `<div style="text-align: center;">
          <strong>${cityName || name}</strong><br/>
          Traffic Level: ${trafficLevel}%
        </div>`,
        { 
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip'
        }
      );

      return marker;
    };

    // Add city markers & curved lines for each country traffic location
    Object.keys(trafficData).forEach((country) => {
      const { trafficLevel, city } = trafficData[country];
      const coordinates = cityCoordinates[country];
      
      if (!coordinates) return;

      // Create city marker with colored circle
      createCityMarker(coordinates, country, trafficLevel, city);

      // Create and add curved line (Philippines to city)
      const curvedLine = createCurvedFlowLine(philippinesCoordinates, coordinates, trafficLevel, city);
      if (curvedLine) {
        curvedLine.bindTooltip(
          `<div style="text-align: center;">
            <strong>Philippines to ${city}</strong><br/>
            Traffic Level: ${trafficLevel}%
          </div>`,
          { 
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip'
          }
        );
        curvedLine.addTo(map);
      }
    });
    
    // Add additional city markers and connections
    additionalCityConnections.forEach((cityData) => {
      const { city, trafficLevel } = cityData;
      const coordinates = additionalCityCoordinates[city];
      
      if (!coordinates) return;
      
      // Create city marker with colored circle
      createCityMarker(coordinates, city, trafficLevel);
      
      // Create and add curved line (Philippines to city)
      const curvedLine = createCurvedFlowLine(philippinesCoordinates, coordinates, trafficLevel, city);
      if (curvedLine) {
        curvedLine.bindTooltip(
          `<div style="text-align: center;">
            <strong>Philippines to ${city}</strong><br/>
            Traffic Level: ${trafficLevel}%
          </div>`,
          { 
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip'
          }
        );
        curvedLine.addTo(map);
      }
    });
    
    // Fix: Add region-to-region connections
    regionToRegionConnections.forEach((connection) => {
      const { toRegion, trafficLevel, condition } = connection as Record<string, any>;
      const toCoordinates = regionCoordinates[toRegion];
      
      if (!toCoordinates) {
        console.error(`Missing coordinates for region: ${toRegion}`);
        return;
      }
      
      console.log(`Creating marker for region: ${toRegion} at ${toCoordinates}`);
      
      // Add a marker for the destination region if not already displayed
      createCityMarker(toCoordinates, toRegion, trafficLevel);
      
      // Create and add curved line between Philippines and the region
      const curvedLine = createCurvedFlowLine(philippinesCoordinates, toCoordinates, trafficLevel, `Philippines to ${toRegion}`, condition);
      
      if (curvedLine) {
        curvedLine.bindTooltip(
          `<div style="text-align: center;">
            <strong>NCR Region to ${toRegion}</strong><br/>
            Traffic Level: ${trafficLevel}%<br/>
            Condition: ${condition}
          </div>`,
          { 
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip'
          }
        );
        curvedLine.addTo(map);
      } else {
        console.error(`Failed to create curved line for: Philippines to ${toRegion}`);
      }
    });
    
    // Fix: Add region-to-city connections
    regionToCityConnections.forEach((connection) => {
      const { fromRegion, toCity, trafficLevel, condition } = connection as Record<string, any>;
      const fromCoordinates = countryCoordinates[fromRegion];
      const toCityCoordinates = additionalCityCoordinates[toCity];
      
      if (!fromCoordinates || !toCityCoordinates) {
        console.error(`Missing coordinates for connection: ${fromRegion} to ${toCity}`);
        return;
      }
      
      // Create and add curved line between region and city
      const curvedLine = createCurvedFlowLine(fromCoordinates, toCityCoordinates, trafficLevel, `${fromRegion} to ${toCity}`, condition);
      if (curvedLine) {
        curvedLine.bindTooltip(
          `<div style="text-align: center;">
            <strong>${fromRegion} to ${toCity}</strong><br/>
            Traffic Level: ${trafficLevel}%<br/>
            Condition: ${condition}
          </div>`,
          { 
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip'
          }
        );
        curvedLine.addTo(map);
      }
    });
    
    // Add city-to-city connections
    cityToCityConnections.forEach((connection) => {
      const { fromCity, toCity, trafficLevel, condition } = connection as Record<string,any>;
      const fromCityCoordinates = additionalCityCoordinates[fromCity];
      const toCityCoordinates = additionalCityCoordinates[toCity];
      
      if (!fromCityCoordinates || !toCityCoordinates) {
        console.error(`Missing coordinates for connection: ${fromCity} to ${toCity}`);
        return;
      }
      
      // Create and add curved line between cities
      const curvedLine = createCurvedFlowLine(fromCityCoordinates, toCityCoordinates, trafficLevel, `${fromCity} to ${toCity}`, condition);
      if (curvedLine) {
        curvedLine.bindTooltip(
          `<div style="text-align: center;">
            <strong>${fromCity} to ${toCity}</strong><br/>
            Traffic Level: ${trafficLevel}%<br/>
            Condition: ${condition}
          </div>`,
          { 
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip'
          }
        );
        curvedLine.addTo(map);
      }
    });

    // Add a marker for the Philippines Server with a special style
    const philippinesIcon = L.divIcon({
      className: 'philippines-dot',
      html: `<div class="dot" style="background: #0000FF; width: 16px; height: 16px;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    
    const philippinesMarker = L.marker(philippinesCoordinates, { icon: philippinesIcon }).addTo(map);
    
    // Add Philippines label - also black and uppercase now
    const philippinesLabelIcon = L.divIcon({
      className: 'city-label',
      html: `<div style="color: black; font-family: geist; font-weight: bold; font-size: .7em; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">MANILA</div>`,
      iconSize: [80, 20],
      iconAnchor: [40, -15],
    });
    L.marker(philippinesCoordinates, { icon: philippinesLabelIcon }).addTo(map);
    
    // Add a highlighted circle for the Philippines
    L.circle(philippinesCoordinates, {
      color: '#0000FF',
      fillColor: '#0000FF',
      fillOpacity: 0.2,
      radius: 200000, // Larger radius for the central hub
      weight: 2
    }).addTo(map);
    
    philippinesMarker.bindTooltip(
      `<div style="text-align: center;">
        <strong>Philippines Server</strong><br/>
        Central Hub
      </div>`,
      { 
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip'
      }
    );

    // Enhanced legend with connection conditions
    const legend = (L as any).control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
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
      `;
      return div;
    };
    legend.addTo(map);

    return () => {
      map.remove();
    };
  };

  useEffect(() => {
    fn();
  }, []);

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

          .twinkling-dot .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            position: absolute;
            animation: twinkle 1.5s infinite ease-in-out;
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
        `}
      </style>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
    </>
  );
};

export default MapComponent;