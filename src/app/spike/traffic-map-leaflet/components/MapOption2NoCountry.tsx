'use client';

import { useEffect } from 'react';
import L from 'leaflet';
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
const geocodeAddress = async (address) => {
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
  'France': { city: 'Paris, France', trafficLevel: 60 },
  'Canada': { city: 'Toronto, Canada', trafficLevel: 40 },
  'China': { city: 'Beijing, China', trafficLevel: 95 },
  'India': { city: 'Mumbai, India', trafficLevel: 70 },
  'Brazil': { city: 'São Paulo, Brazil', trafficLevel: 55 },
  'South Korea': { city: 'Seoul, South Korea', trafficLevel: 35 },
  'Australia': { city: 'Sydney, Australia', trafficLevel: 25 },
  'Italy': { city: 'Rome, Italy', trafficLevel: 50 },
  'South Africa': { city: 'Johannesburg, South Africa', trafficLevel: 20 },
  'Mexico': { city: 'Mexico City, Mexico', trafficLevel: 65 },
  'Spain': { city: 'Madrid, Spain', trafficLevel: 40 },
  'Turkey': { city: 'Istanbul, Turkey', trafficLevel: 75 },
  'Netherlands': { city: 'Amsterdam, Netherlands', trafficLevel: 30 },
  'Indonesia': { city: 'Jakarta, Indonesia', trafficLevel: 80 },
  'Saudi Arabia': { city: 'Riyadh, Saudi Arabia', trafficLevel: 50 },
  'Argentina': { city: 'Buenos Aires, Argentina', trafficLevel: 45 },
  'Thailand': { city: 'Bangkok, Thailand', trafficLevel: 35 },
  'Sweden': { city: 'Stockholm, Sweden', trafficLevel: 25 },
  // 'Russia': { city: 'Moscow, Russia', trafficLevel: 45 },
};


// Function to determine traffic color
const getTrafficColor = (trafficLevel) => {
  if (trafficLevel > 80) return "rgba(255, 0, 0, 0.7)"; // 🔴 Very High
  if (trafficLevel >= 50) return "rgba(255, 165, 0, 0.7)"; // 🟠 High
  if (trafficLevel >= 30) return "rgba(255, 255, 0, 0.7)"; // 🟡 Medium
 return "rgba(0, 128, 0, 0.7)"; // 🟢 Low
};

// Function to create a **curved** traffic flow line using Bezier curves
const createCurvedFlowLine = (fromCoord, toCoord, trafficLevel) => {
  const curvePoints = [];
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

  return L.polyline(curvePoints, {
    color: getTrafficColor(trafficLevel),
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
    
    const cityCoordinates = {};
    for (const country in trafficData) {
      cityCoordinates[country] = await geocodeAddress(trafficData[country].city);
    }
    const philippinesCoordinates = await geocodeAddress('Manila, Philippines');

    L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://stamen.com/">Stamen Maps</a>',
      maxZoom: 20,
    }).addTo(map);

    const [countries, states] = await Promise.all([fetchCountryBorders(), fetchUSStatesBorders()]);
    const geojson = { ...countries, features: [...countries.features, ...states.features] };

    // Add tooltips to regions
    L.geoJSON(geojson, {
      style: (feature) => {
        const countryName = feature.properties.name;
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
    
        if (trafficLevel) {
          // Add country label
          const center = layer.getBounds().getCenter();
          const label = L.divIcon({
            className: 'country-label',
            html: `<div style="color: gray; font-family: geist; font-weight: bold; font-size: .8em ">${countryName.toUpperCase()}</div>`,
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

    // Function to create a twinkling dot with tooltip
    const createTwinklingDot = (coordinates, country, trafficLevel) => {
      const divIcon = L.divIcon({
        className: 'twinkling-dot',
        html: `<div class="dot" style="background:${getTrafficColor(trafficLevel)};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker(coordinates, { icon: divIcon }).addTo(map);
      
      // Add tooltip to the dot
      // marker.bindTooltip(
      //   `<div style="text-align: center;">
      //     <strong>${country}</strong><br/>
      //     Traffic Level: ${trafficLevel}%<br/>
      //     City: ${trafficData[country]?.city || 'Philippines Server'}
      //   </div>`,
      //   { 
      //     permanent: false,
      //     direction: 'top',
      //     className: 'custom-tooltip'
      //   }
      // );

      return marker;
    };

    // Add twinkling dots & curved lines for each traffic location
    Object.keys(trafficData).forEach((country) => {
      const { trafficLevel } = trafficData[country];
      const coordinates = cityCoordinates[country];

      createTwinklingDot(coordinates, country, trafficLevel);

      // Create and add curved line using Bezier interpolation
      const curvedLine = createCurvedFlowLine(coordinates, philippinesCoordinates, trafficLevel);
      curvedLine.bindTooltip(
        `<div style="text-align: center;">
          <strong>${country} to Philippines</strong><br/>
          Traffic Level: ${trafficLevel}%
        </div>`,
        { 
          permanent: false,
          direction: 'center',
          className: 'custom-tooltip'
        }
      );
      curvedLine.addTo(map);
    });

    // Add a twinkling dot for the Philippines Server
    createTwinklingDot(philippinesCoordinates, 'Philippines Server', 100);

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
        `}
      </style>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
    </>
  );
};

export default MapComponent;