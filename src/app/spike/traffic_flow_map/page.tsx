"use client";

import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Style, Fill, Stroke } from "ol/style";
import { LineString, Point } from "ol/geom";
import Feature from "ol/Feature";
import { fromLonLat, toLonLat } from "ol/proj";
// import countriesGeoJSON from "./countries.json"; // World country boundaries
const countriesGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "United States" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-125.0, 49.0], [-66.9, 49.0], [-66.9, 24.4], [-125.0, 24.4], [-125.0, 49.0]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Philippines" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[120.0, 18.5], [126.0, 18.5], [126.0, 5.0], [120.0, 5.0], [120.0, 18.5]]]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "United Kingdom" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[-8.0, 60.0], [2.0, 60.0], [2.0, 50.0], [-8.0, 50.0], [-8.0, 60.0]]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "France" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[-5.0, 51.0], [8.0, 51.0], [8.0, 42.0], [-5.0, 42.0], [-5.0, 51.0]]
        ]
      }
    }
  ]
}


// 🌍 Traffic Data (From which country → PH, with traffic amount)
const trafficData = [
  { country: "USA", lon: -99.1332, lat: 38.9072, count: 30 }, // Washington, USA
  { country: "France", lon: 2.3522, lat: 48.8566, count: 18 }, // Paris, France
  { country: "Japan", lon: 139.6917, lat: 35.6895, count: 12 }, // Tokyo, Japan
  { country: "UK", lon: -0.1278, lat: 51.5074, count: 25 }, // London, UK
  { country: "Germany", lon: 13.405, lat: 52.52, count: 9 }, // Berlin, Germany
];

const PHILIPPINES_COORD = [121.774, 12.8797]; // Manila, Philippines

// 🎨 Color based on traffic volume
const getTrafficColor = (count) => {
  if (count > 20) return "rgba(255, 0, 0, 0.6)"; // Red (High)
  if (count >= 10) return "rgba(255, 255, 0, 0.6)"; // Yellow (Medium)
  return "rgba(0, 255, 0, 0.6)"; // Green (Low)
};

// 📍 Convert traffic data into flow lines
const createFlowLines = (data) => {
  return data.map(({ lon, lat, count }) => {
    const from = fromLonLat([lon, lat]);
    const to = fromLonLat(PHILIPPINES_COORD);

    // Create a curved line for smooth effect
    const midPoint = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 - 500000, // Adjust curve height
    ];

    const line = new LineString([from, midPoint, to]);

    const feature = new Feature({ geometry: line });
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: getTrafficColor(count),
          width: Math.min(6, count / 5), // Scale width
        }),
      })
    );

    return feature;
  });
};

const HeatmapMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 🌍 Country Layer with Coloring
    const countryLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(countriesGeoJSON, {
          featureProjection: "EPSG:3857", // Ensures it matches map projection
        }),
      }),
      style: (feature) => {
        const countryName = feature.get("name");
        const traffic = trafficData.find((t) => t.country === countryName)?.count || 0;
    
        return new Style({
          fill: new Fill({ color: getTrafficColor(traffic) }), // Color fill based on traffic
          stroke: new Stroke({ color: "#333", width: 1 }), // Country border
        });
      },
    });
    

    // 🔄 Flow Line Layer
    const flowLineLayer = new VectorLayer({
      source: new VectorSource({ features: createFlowLines(trafficData) }),
    });

    // 🗺 Initialize Map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }), // Base map
        countryLayer, // Country coloring
        flowLineLayer, // Traffic flow lines
      ],
      view: new View({
        center: fromLonLat([121.774, 12.8797]), // Focus on PH
        zoom: 3,
      }),
    });

    return () => map.setTarget(null);
  }, []);

  return <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default HeatmapMap;
