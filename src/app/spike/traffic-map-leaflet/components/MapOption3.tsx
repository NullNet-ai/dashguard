"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet-arc"; // Add Leaflet Arc Plugin


const singaporeFeature = {
  "type": "Feature",
  "properties": { "name": "Singapore" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [103.640098, 1.260585], [103.710898, 1.258038], [103.743156, 1.283078], 
        [103.773727, 1.316053], [103.818138, 1.360389], [103.865906, 1.382468], 
        [103.892601, 1.388595], [103.925774, 1.375625], [103.977585, 1.343852], 
        [103.994675, 1.315953], [104.001122, 1.289962], [104.001550, 1.266249], 
        [103.993813, 1.241437], [103.963013, 1.204795], [103.927307, 1.183375], 
        [103.876869, 1.170306], [103.822311, 1.162489], [103.771187, 1.162089], 
        [103.719063, 1.173606], [103.673637, 1.192195], [103.649261, 1.214515], 
        [103.640098, 1.260585]
      ]
    ]
  }
}





const fetchCountryBorders = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
  );
  return await response.json();
};

const fetchUSStatesBorders = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
  );
  return await response.json();
};

const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
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
  if (trafficLevel > 80) return "rgb(220, 38, 38, 0.7)";
  if (trafficLevel >= 50) return "rgba(255, 165, 0, 0.7)";
  if (trafficLevel >= 30) return "rgba(255, 255, 0, 0.7)";
  return "rgba(0, 128, 0, 0.7)";
};

const createCurvedFlowLine = (fromCoord, toCoord, trafficLevel) => {
  const curvePoints = [];
  const segments = 50;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = fromCoord[1] * (1 - t) + toCoord[1] * t;
    const y = fromCoord[0] * (1 - t) + toCoord[0] * t + Math.sin(Math.PI * t) * 20;
    curvePoints.push([y, x]);
  }
  return L.polyline(curvePoints, {
    color: getTrafficColor(trafficLevel),
    weight: Math.max(3, trafficLevel / 20),
    opacity: 0.8,
    dashArray: "5, 5",
  });
};

const MapComponent = () => {
  const fn = async () => {
    const map = L.map("map", {
      center: [14.5995, 120.9842],
      zoom: 3,
      minZoom: 3,
      maxZoom: 8,
      worldCopyJump: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
      maxZoom: 20,
      noWrap: true,
    }).addTo(map);

    const [countries, states] = await Promise.all([fetchCountryBorders(), fetchUSStatesBorders()]);
    const geojson = { ...countries, features: [...countries.features, ...states.features] };
    console.log('%c Line:105 🌽 countries', 'color:#f5ce50', countries);
    console.log('%c Line:105 🍐 geojson', 'color:#4fff4B', geojson);
// Add to existing GeoJSON
geojson.features.push(singaporeFeature);
    const tooltip = L.tooltip({
      permanent: false,
      direction: "top",
      className: "custom-tooltip",
    });

    L.geoJSON(geojson, {
      style: (feature) => {
        let countryName = feature.properties.name;
    
        // Check if it's a US state
        if (states.features.some(state => state.properties.name === countryName)) {
          countryName = "United States of America"; // Assign US traffic data
        }
    
        const trafficLevel = trafficData[countryName]?.trafficLevel;
        return {
          fillColor: trafficLevel ? getTrafficColor(trafficLevel) : "transparent",
          weight: 1,
          opacity: 1,
          color: "white",
          fillOpacity: trafficLevel ? 0.4 : 0.1,
        };
      },
      onEachFeature: (feature, layer) => {
        let countryName = feature.properties.name;
    
        // Check if it's a US state
        if (states.features.some(state => state.properties.name === countryName)) {
          countryName = "United States of America";
        }
    
        if (trafficData[countryName]) {
          layer.on("mouseover", function (e) {
            layer.setStyle({ fillOpacity: 0.7 });
    
            tooltip.setLatLng(e.latlng).setContent(
              `<strong>${feature.properties.name}</strong><br>Traffic Level: ${trafficData[countryName].trafficLevel}`
            );
            tooltip.addTo(map);
          });
    
          layer.on("mousemove", function (e) {
            tooltip.setLatLng(e.latlng);
          });
    
          layer.on("mouseout", function () {
            layer.setStyle({ fillOpacity: 0.4 });
            tooltip.remove();
          });
        }
      },
    }).addTo(map);
    

    const cityCoordinates = {};
    for (const country in trafficData) {
      cityCoordinates[country] = await geocodeAddress(trafficData[country].city);
    }
    const philippinesCoordinates = await geocodeAddress("Manila, Philippines");

    const createTwinklingDot = (coordinates, trafficLevel) => {
      const divIcon = L.divIcon({
        className: "twinkling-dot",
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

          .custom-tooltip {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 10px;
            font-size: 14px;
            border-radius: 4px;
            box-shadow: 0px 0px 8px rgba(255, 255, 255, 0.5);
          }
        `}
      </style>
      <div id="map" style={{ height: "100vh", width: "100%" }} />
    </>
  );
};

export default MapComponent;
