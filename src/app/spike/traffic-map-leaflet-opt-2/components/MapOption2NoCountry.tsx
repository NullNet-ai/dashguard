'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-arc';

const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json&polygon_geojson=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        geojson: data[0].geojson
      };
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
  // 'United States of America': { city: 'New York, USA', trafficLevel: 85 },
  'Japan': { city: 'Tokyo, Japan', trafficLevel: 30 },
  // 'Germany': { city: 'Berlin, Germany', trafficLevel: 50 },
  'France': { city: 'Paris, France', trafficLevel: 60 },
  'China': { city: 'Beijing, China', trafficLevel: 95 },
  'India': { city: 'Mumbai, India', trafficLevel: 70 },
  'Brazil': { city: 'São Paulo, Brazil', trafficLevel: 55 },
  'South Korea': { city: 'Seoul, South Korea', trafficLevel: 35 },
  'Australia': { city: 'Sydney, Australia', trafficLevel: 25 },
  'Italy': { city: 'Rome, Italy', trafficLevel: 50 },
  // 'Mexico': { city: 'Mexico City, Mexico', trafficLevel: 65 },
  'Spain': { city: 'Madrid, Spain', trafficLevel: 40 },
  'Netherlands': { city: 'Amsterdam, Netherlands', trafficLevel: 30 },
  'Indonesia': { city: 'Jakarta, Indonesia', trafficLevel: 80 },
  'Saudi Arabia': { city: 'Riyadh, Saudi Arabia', trafficLevel: 50 },
  'Thailand': { city: 'Bangkok, Thailand', trafficLevel: 35 },
};

const getTrafficColor = (trafficLevel) => {
  if (trafficLevel > 80) return "rgba(255, 0, 0, 0.7)";
  if (trafficLevel >= 50) return "rgba(255, 165, 0, 0.7)";
  if (trafficLevel >= 30) return "rgba(255, 255, 0, 0.7)";
  return "rgba(0, 128, 0, 0.7)";
};

const createFlowLine = (map, fromCoord, toCoord, trafficLevel, cityName) => {
  const color = getTrafficColor(trafficLevel);
  const weight = (trafficLevel / 100) * 5 + 1;

  const latlngs = [[fromCoord[0], fromCoord[1]], [toCoord[0], toCoord[1]]];
  const options = {
    color: color,
    weight: weight,
    vertices: 200,
    offset: 20
  };

  const arc = L.Polyline.Arc(fromCoord, toCoord, options).addTo(map);

  arc.bindTooltip(`${cityName}<br>Traffic Level: ${trafficLevel}%`, {
    permanent: false,
    direction: 'top'
  });

  return arc;
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

    const cityData = {};
    for (const country in trafficData) {
      cityData[country] = await geocodeAddress(trafficData[country].city);
    }

    const philippineCities = {
      Manila: await geocodeAddress('Manila, Philippines')
    };

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
    }).addTo(map);

    const createCityPolygon = (geojson, trafficLevel, cityName) => {
      if (!geojson) return null;
      const color = getTrafficColor(trafficLevel);
      const style = {
        fillColor: color,
        fillOpacity: 0.6,
        color: color,
        weight: 2,
        opacity: 0.8
      };
      return L.geoJSON(geojson, {
        style: style,
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`${cityName}<br>Traffic Level: ${trafficLevel}%`);
        }
      }).addTo(map);
    };

    Object.entries(philippineCities).forEach(([city, data]) => {
      if (data && data.geojson) {
        createCityPolygon(data.geojson, 100, city);
      }
    });

    Object.entries(trafficData).forEach(([country, { city: cityName, trafficLevel }]) => {
      const data = cityData[country];
      if (data && data.geojson) {
        createCityPolygon(data.geojson, trafficLevel, cityName.split(',')[0]);
      }
    });

    if (philippineCities.Manila) {
      const manilaCoords = [philippineCities.Manila.lat, philippineCities.Manila.lon];

      Object.entries(cityData).forEach(([country, data]) => {
        if (data) {
          const destCoords = [data.lat, data.lon];
          const trafficLevel = trafficData[country].trafficLevel;
          createFlowLine(map, manilaCoords, destCoords, trafficLevel, trafficData[country].city);
        }
      });
    }
  };

  useEffect(() => {
    fn();
  }, []);

  return (
    <>
      <style>
        {`
          .leaflet-popup-content {
            font-size: 14px;
            text-align: center;
            padding: 8px;
          }

          .flow-dot {
            animation: flowDot 1s infinite;
          }

          @keyframes flowDot {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
          }
        `}
      </style>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
    </>
  );
};

export default MapComponent;
