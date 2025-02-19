'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-arc'; // Add Leaflet Arc Plugin

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

const Map = () => {
  const fn = async () => {
    const map = L.map('map').setView([14.5995, 120.9842], 3);

    // Fetch coordinates for traffic locations
    const ukCoordinates = await geocodeAddress("London, UK");
    const japanCoordinates = await geocodeAddress("Tokyo, Japan");
    const californiaCoordinates = await geocodeAddress("Los Angeles, CA, USA");
    const philippinesCoordinates = await geocodeAddress("Manila, Philippines");

    // Load English map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">Carto</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Traffic data for each location
    const trafficData = {
      'United Kingdom': { coordinates: ukCoordinates, trafficLevel: 75 },
      'Japan': { coordinates: japanCoordinates, trafficLevel: 30 },
      'California': { coordinates: californiaCoordinates, trafficLevel: 90 },
    };

    // Function to determine traffic color
    const getTrafficColor = (trafficLevel) => {
      if (trafficLevel > 70) return 'red'; // 🔴 High traffic
      if (trafficLevel > 30) return 'orange'; // 🟠 Medium traffic
      return 'green'; // 🟢 Low traffic
    };

    // Fetch country and US state borders
    const [countries, states] = await Promise.all([fetchCountryBorders(), fetchUSStatesBorders()]);
    const geojson = { ...countries, features: [...countries.features, ...states.features] };

    // Color affected regions
    L.geoJSON(geojson, {
      style: (feature) => {
        const countryName = feature.properties.name;
        const countryTraffic = trafficData[countryName];

        if (countryTraffic) {
          return {
            fillColor: getTrafficColor(countryTraffic.trafficLevel),
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.5,
          };
        } else {
          return {
            fillColor: 'transparent',
            weight: 1,
            opacity: 1,
            color: 'gray',
            fillOpacity: 0.1,
          };
        }
      },
    }).addTo(map);

    // Function to create a great-circle curved line
    const createGreatCircleCurve = (start, end, trafficLevel) => {
      const arcOptions = {
        color: getTrafficColor(trafficLevel),
        weight: 3,
        dashArray: '5, 5', // Dotted curve for visibility
        opacity: 0.7,
      };

      return L.Polyline.Arc(start, end, { offset: 10, ...arcOptions });
    };

    // Add markers and curved lines for each traffic location
    Object.keys(trafficData).forEach((country) => {
      const { coordinates, trafficLevel } = trafficData[country];

      // Add a circle marker
      L.circleMarker(coordinates, {
        color: getTrafficColor(trafficLevel),
        fillColor: getTrafficColor(trafficLevel),
        fillOpacity: 0.9,
        radius: 8,
      })
        .addTo(map)
        .bindPopup(`${country}: Traffic Level - ${trafficLevel}`);

      // Create and add great-circle curved line
      const curvedLine = createGreatCircleCurve(coordinates, philippinesCoordinates, trafficLevel);
      console.log('%c Line:127 🍷 coordinates', 'color:#b03734', coordinates);
      curvedLine.bindPopup(`${country} to PH: Traffic Level - ${trafficLevel}`);
      curvedLine.addTo(map);
    });

    // Add a circle marker for the Philippines Server
    L.circleMarker(philippinesCoordinates, {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.9,
      radius: 10,
    })
      .addTo(map)
      .bindPopup('Philippines Server');

    return () => {
      map.remove();
    };
  };

  useEffect(() => {
    fn();
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
};

export default Map;
