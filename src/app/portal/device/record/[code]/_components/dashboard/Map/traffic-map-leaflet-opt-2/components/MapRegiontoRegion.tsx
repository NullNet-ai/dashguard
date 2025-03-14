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
  'United Kingdom': { region: 'England, UK', trafficLevel: 75 },
  'Japan': { region: 'Kanto, Japan', trafficLevel: 30 },
  'France': { region: 'Île-de-France, France', trafficLevel: 60 },
  'China': { region: 'Beijing Municipality, China', trafficLevel: 95 },
  'India': { region: 'Maharashtra, India', trafficLevel: 70 },
  'Brazil': { region: 'São Paulo State, Brazil', trafficLevel: 55 },
  'South Korea': { region: 'Seoul Capital Area, South Korea', trafficLevel: 35 },
  'Australia': { region: 'New South Wales, Australia', trafficLevel: 25 },
  'Italy': { region: 'Lazio, Italy', trafficLevel: 50 },
  'Spain': { region: 'Community of Madrid, Spain', trafficLevel: 40 },
  'Netherlands': { region: 'North Holland, Netherlands', trafficLevel: 30 },
  'Indonesia': { region: 'Jakarta Special Capital Region, Indonesia', trafficLevel: 80 },
  'Saudi Arabia': { region: 'Riyadh Province, Saudi Arabia', trafficLevel: 50 },
  'Thailand': { region: 'Bangkok Metropolitan Region, Thailand', trafficLevel: 35 },
};

const getTrafficColor = (trafficLevel) => {
  if (trafficLevel > 80) return "rgba(255, 0, 0, 0.7)";
  if (trafficLevel >= 50) return "rgba(255, 165, 0, 0.7)";
  if (trafficLevel >= 30) return "rgba(255, 255, 0, 0.7)";
  return "rgba(0, 128, 0, 0.7)";
};

const createFlowLine = (map, fromCoord, toCoord, trafficLevel, regionName) => {
  const color = getTrafficColor(trafficLevel);
  const weight = (trafficLevel / 100) * 5 + 1;

  const latlngs = [[fromCoord[0], fromCoord[1]], [toCoord[0], toCoord[1]]];
  const options = {
    color: color,
    weight: weight,
    dashArray: '10, 10',
    vertices: 200,
    offset: 20
  };

  const arc = L.Polyline.Arc(fromCoord, toCoord, options).addTo(map);

  arc.bindTooltip(`${regionName}<br>Traffic Level: ${trafficLevel}%`, {
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

    const regionData = {};
    for (const country in trafficData) {
      regionData[country] = await geocodeAddress(trafficData[country].region);
    }

    const philippineRegions = {
      NCR: await geocodeAddress('National Capital Region, Philippines')
    };

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      noWrap: true,
    }).addTo(map);

    const createRegionPolygon = (geojson, trafficLevel, regionName) => {
      if (!geojson) return null;
      const color = getTrafficColor(trafficLevel);
      const style = {
        fillColor: color,
        fillOpacity: 0.6,
        color: color, // Removed border
        weight: 0,
        opacity: 0.8
      };
      return L.geoJSON(geojson, {
        style: style,
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`${regionName}<br>Traffic Level: ${trafficLevel}%`);
        }
      }).addTo(map);
    };

    Object.entries(philippineRegions).forEach(([region, data]) => {
      if (data && data.geojson) {
        createRegionPolygon(data.geojson, 100, region);
      }
    });

    Object.entries(trafficData).forEach(([country, { region: regionName, trafficLevel }]) => {
      const data = regionData[country];
      if (data && data.geojson) {
        createRegionPolygon(data.geojson, trafficLevel, regionName.split(',')[0]);
      }
    });

    if (philippineRegions.NCR) {
      const ncrCoords = [philippineRegions.NCR.lat, philippineRegions.NCR.lon];

      Object.entries(regionData).forEach(([country, data]) => {
        if (data) {
          const destCoords = [data.lat, data.lon];
          const trafficLevel = trafficData[country].trafficLevel;
          createFlowLine(map, ncrCoords, destCoords, trafficLevel, trafficData[country].region);
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
