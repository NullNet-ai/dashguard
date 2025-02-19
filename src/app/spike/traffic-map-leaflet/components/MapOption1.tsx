'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-arc';

const fetchCountryBorders = async () => {
  const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
  return await response.json();
};

const fetchUSStatesBorders = async () => {
  const response = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
  return await response.json();
};

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
  'Russia': { city: 'Moscow, Russia', trafficLevel: 45 },
};

const getTrafficColor = (trafficLevel) => {
  if (trafficLevel > 80) return "#DC2626";
  if (trafficLevel >= 50) return "#EAB308";
  if (trafficLevel >= 30) return "#F97316";
  return "#16A34A";
};

const createCurvedFlowLine = (fromCoord, toCoord, trafficLevel) => {
  const curvePoints = [];
  const segments = 50;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = fromCoord[1] * (1 - t) + toCoord[1] * t;
    const y =
      fromCoord[0] * (1 - t) +
      toCoord[0] * t +
      Math.sin(Math.PI * t) * 20;

    curvePoints.push([y, x]);
  }

  return L.polyline(curvePoints, {
    color: getTrafficColor(trafficLevel),
    weight: Math.max(3, trafficLevel / 20),
    opacity: 0.8,
    dashArray: '5, 5',
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      noWrap: true,
    }).addTo(map);

    const [countries, states] = await Promise.all([fetchCountryBorders(), fetchUSStatesBorders()]);
    const geojson = { ...countries, features: [...countries.features, ...states.features] };

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
          // Add tooltip to the country
          layer.bindTooltip(`
            <div style="font-family: Arial, sans-serif; padding: 5px;">
              <strong>${countryName}</strong><br/>
              Traffic Level: ${trafficLevel}%
            </div>
          `, {
            permanent: false,
            direction: 'auto',
            className: 'country-tooltip'
          });

          // Add hover effects
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle({
                fillOpacity: 0.7,
                weight: 2
              });
            },
            mouseout: (e) => {
              const layer = e.target;
              layer.setStyle({
                fillOpacity: 0.4,
                weight: 1
              });
            }
          });
        }
      }
    }).addTo(map);

    const createTwinklingDot = (coordinates, trafficLevel) => {
      const divIcon = L.divIcon({
        className: 'twinkling-dot',
        html: `<div class="dot" style="background:${getTrafficColor(trafficLevel)};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      return L.marker(coordinates, { icon: divIcon }).addTo(map);
    };

    Object.keys(trafficData).forEach((country) => {
      const { trafficLevel } = trafficData[country];
      const coordinates = cityCoordinates[country];

      createTwinklingDot(coordinates, trafficLevel);

      const curvedLine = createCurvedFlowLine(coordinates, philippinesCoordinates, trafficLevel);
      curvedLine.bindPopup(`${country} to PH: Traffic Level - ${trafficLevel}`);
      curvedLine.addTo(map);
    });

    createTwinklingDot(philippinesCoordinates, 100);

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

          .country-tooltip {
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
        `}
      </style>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
    </>
  );
};

export default MapComponent;