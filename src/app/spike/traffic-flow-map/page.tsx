"use client";

import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { LineString, MultiPolygon, Point } from "ol/geom";

// Traffic Data
const trafficData = {
  "Philippines": { count: 50 }, // Special case: Server location
  "United States": { count: 30 },
  "France": { count: 18 },
  "United Kingdom": { count: 25 },
  "Germany": { count: 9 }
};

// Philippines (Server) Location
const PHILIPPINES_COORD = [121.774, 12.8797];

// Color Function (For Country Fill & Server Highlight)
const getTrafficColor = (count, isServer = false) => {
  if (isServer) return "rgba(0, 0, 255, 0.7)"; // 🔵 BLUE for the Server (Philippines)
  if (count > 25) return "rgba(255, 0, 0, 0.7)"; // 🔴 Very High
  if (count >= 15) return "rgba(255, 165, 0, 0.7)"; // 🟠 High
  if (count >= 5) return "rgba(255, 255, 0, 0.7)"; // 🟡 Medium
  if (count > 0) return "rgba(0, 128, 0, 0.7)"; // 🟢 Low
  return "rgba(255, 255, 255, 1)"; // ⚪ Default: White
};

// GeoJSON URL for country shapes
const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

// Get centroid of a polygon/multipolygon
const getCentroid = (geometry) => {
  if (!geometry) return null;
  let coords;
  if (geometry instanceof MultiPolygon) {
    coords = geometry.getPolygons()[0].getInteriorPoint().getCoordinates();
  } else {
    coords = geometry.getInteriorPoint().getCoordinates();
  }
  return toLonLat(coords);
};

// Create **Curved** Traffic Flow Line from PH → Country
const createCurvedFlowLine = (toCoord, count) => {
  const from = fromLonLat(PHILIPPINES_COORD);
  const to = fromLonLat(toCoord);

  // Create smooth arc points
  const curvePoints = [];
  const segments = 50; // Smoothness
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = from[0] * (1 - t) + to[0] * t;
    const y = from[1] * (1 - t) + to[1] * t + Math.sin(Math.PI * t) * 5000000; // More visible curve
    curvePoints.push([x, y]);
  }

  const line = new LineString(curvePoints);
  const feature = new Feature({ geometry: line });
  feature.setStyle(
    new Style({
      stroke: new Stroke({
        color: getTrafficColor(count),
        width: Math.max(2, count / 10),
        lineDash: count > 20 ? [5, 5] : [10, 5] // Different dash for high traffic
      })
    })
  );
  return feature;
};

const HeatmapMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    fetch(GEOJSON_URL)
      .then(response => response.json())
      .then(geoJsonData => {
        const geoJsonFormat = new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857"
        });

        const countrySource = new VectorSource({
          features: geoJsonFormat.readFeatures(geoJsonData)
        });

        const flowLines = new VectorSource();
        const serverLayer = new VectorSource();

        countrySource.getFeatures().forEach(feature => {
          const properties = feature.getProperties();
          const countryName = properties.ADMIN || properties.name || properties.sovereignt;
          const trafficInfo = trafficData[countryName];

          const isServer = countryName === "Philippines"; // Check if it's the server

          // **Ensure Full Country Coloring**
          feature.setStyle(new Style({
            fill: new Fill({
              color: getTrafficColor(trafficInfo?.count, isServer) // Apply special color for PH
            }),
            stroke: new Stroke({
              color: isServer ? "#0000FF" : "#000000", // Blue border for PH
              width: isServer ? 3 : 1.5
            })
          }));

          // **Ensure Traffic Flow from PH → Target Country**
          if (trafficInfo && !isServer) {
            const countryCenter = getCentroid(feature.getGeometry());
            if (countryCenter) {
              flowLines.addFeature(createCurvedFlowLine(countryCenter, trafficInfo.count));
            }
          }
        });

        // **Add Server Marker in PH**
        const serverMarker = new Feature({
          geometry: new Point(fromLonLat(PHILIPPINES_COORD))
        });
        serverMarker.setStyle(
          new Style({
            image: new Circle({
              radius: 8,
              fill: new Fill({ color: "blue" }), // Blue for server
              stroke: new Stroke({ color: "white", width: 2 })
            })
          })
        );
        serverLayer.addFeature(serverMarker);

        // **Initialize Map**
        const map = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({ source: new OSM() }),
            new VectorLayer({ source: countrySource }), // Countries Layer
            new VectorLayer({ source: flowLines }), // Flow Lines Layer
            new VectorLayer({ source: serverLayer }) // Server Marker Layer
          ],
          view: new View({
            center: fromLonLat(PHILIPPINES_COORD),
            zoom: 3,
            maxZoom: 12,
            minZoom: 2
          })
        });

        return () => map.setTarget(null);
      })
      .catch(error => console.error("Error loading GeoJSON:", error));
  }, []);

  return <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default HeatmapMap;
