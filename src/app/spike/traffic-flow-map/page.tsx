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
import { LineString } from "ol/geom";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";

// Define the traffic data
const trafficData = {
  "United States": { count: 30 },
  "France": { count: 18 },
  "United Kingdom": { count: 25 },
  "Germany": { count: 9 }
};

const PHILIPPINES_COORD = [121.774, 12.8797];
const countriesGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "USA",
      "properties": { "name": "United States" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [[-125, 48.5], [-123, 48.5], [-95, 49], [-85, 45], 
             [-80, 43], [-75, 40], [-70, 43], [-69, 47],
             [-125, 48.5]]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "PHL",
      "properties": { "name": "Philippines" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [[119, 5], [119, 15], [122, 15], [122, 5], [119, 5]]
          ],
          [
            [[123, 8], [123, 12], [125, 12], [125, 8], [123, 8]]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "GBR",
      "properties": { "name": "United Kingdom" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [[-5.5, 50], [-1.5, 50], [-1.5, 55], [-5.5, 55], [-5.5, 50]]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "FRA",
      "properties": { "name": "France" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [[-4, 43], [3, 43], [7, 49], [-2, 49], [-4, 43]]
          ]
        ]
      }
    }
  ]
};
const getTrafficColor = (count) => {
  if (count > 20) return "rgba(255, 0, 0, 0.6)";
  if (count >= 10) return "rgba(255, 165, 0, 0.6)";
  return "rgba(0, 0, 255, 0.6)";
};

const createFlowLine = (fromCoord, count) => {
  const from = fromLonLat(fromCoord);
  const to = fromLonLat(PHILIPPINES_COORD);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const midPoint = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + (Math.abs(dx) > Math.abs(dy) ? dy : dx) * 0.25
  ];
  
  const line = new LineString([from, midPoint, to]);
  const feature = new Feature({ geometry: line });
  feature.setStyle(
    new Style({
      stroke: new Stroke({
        color: getTrafficColor(count),
        width: Math.max(1, Math.min(4, count / 8)),
        lineDash: [1, 5]
      })
    })
  );
  return feature;
};

const HeatmapMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create the GeoJSON format reader
    const geoJsonFormat = new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    // Create vector source for countries
    const countrySource = new VectorSource({
      features: geoJsonFormat.readFeatures(countriesGeoJSON)
    });

    // Style the countries based on traffic data
    countrySource.getFeatures().forEach(feature => {
      const countryName = feature.getProperties().name;
      const trafficInfo = trafficData[countryName];
      
      feature.setStyle(new Style({
        fill: new Fill({
          color: trafficInfo ? getTrafficColor(trafficInfo.count) : 'rgba(200, 200, 200, 0.6)'
        }),
        stroke: new Stroke({
          color: '#333333',
          width: 1
        })
      }));
    });

    // Create flow lines for countries with traffic data
    const flowLines = [];
    countriesGeoJSON.features.forEach(feature => {
      const countryName = feature.properties.name;
      const trafficInfo = trafficData[countryName];
      
      if (trafficInfo) {
        // Calculate centroid of the country for flow line start point
        const coords = feature.geometry.coordinates[0][0];
        const centerLon = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
        const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
        
        flowLines.push(createFlowLine([centerLon, centerLat], trafficInfo.count));
      }
    });

    // Create flow lines layer
    const flowLineLayer = new VectorLayer({
      source: new VectorSource({
        features: flowLines
      })
    });

    // Initialize map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: countrySource }),
        flowLineLayer
      ],
      view: new View({
        center: fromLonLat(PHILIPPINES_COORD),
        zoom: 3,
        maxZoom: 12,
        minZoom: 2
      })
    });

    return () => map.setTarget(null);
  }, []);

  return <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default HeatmapMap;