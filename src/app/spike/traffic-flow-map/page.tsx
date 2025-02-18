"use client";

import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";
import { LineString, Point } from "ol/geom";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { ZoomSlider, Zoom } from "ol/control";

// Define the traffic data with index numbers
const trafficData = {
  "United States": { count: 30, index: 8 },
  "France": { count: 18, index: 3 },
  "United Kingdom": { count: 25, index: 1 },
  "Germany": { count: 9, index: 2 }
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
    },
    {
      "type": "Feature",
      "id": "DEU",
      "properties": { "name": "Germany" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [[6, 47], [14, 47], [14, 55], [6, 55], [6, 47]]
          ]
        ]
      }
    }
  ]
};

const createFlowLine = (fromCoord, count) => {
  const from = fromLonLat(fromCoord);
  const to = fromLonLat(PHILIPPINES_COORD);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  
  // Create a curved line with more control points for smoother curve
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midPoint = [
    from[0] + dx * 0.5,
    from[1] + dy * 0.5 + distance * 0.15
  ];
  
  const line = new LineString([from, midPoint, to]);
  const feature = new Feature({ geometry: line });
  
  feature.setStyle(
    new Style({
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.7)',
        width: Math.max(1, Math.min(3, count / 10))
      })
    })
  );
  
  return feature;
};

const createCountryMarker = (coord, index) => {
  const feature = new Feature({
    geometry: new Point(fromLonLat(coord))
  });
  
  feature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 12,
        fill: new Fill({ color: 'white' }),
        stroke: new Stroke({ color: 'black', width: 1 })
      }),
      text: new Text({
        text: index.toString(),
        fill: new Fill({ color: 'black' }),
        font: '14px Arial'
      })
    })
  );
  
  return feature;
};

const HeatmapMap = () => {
  const mapRef = useRef(null);
  const [liveConnections, setLiveConnections] = useState(true);

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
    
    // Style the countries based on traffic data - more subtle fill
    countrySource.getFeatures().forEach(feature => {
      const countryName = feature.getProperties().name;
      const trafficInfo = trafficData[countryName];
      
      console.log("%c Line:179 🍏 trafficInfo", "color:#fca650", trafficInfo);
      if (trafficInfo) {
        feature.setStyle(new Style({
          fill: new Fill({
            color: 'rgba(100, 120, 160, 1)'
          }),
          stroke: new Stroke({
            color: '#6e7377',
            width: 0.5
          })
        }));
      } else {
        feature.setStyle(new Style({
          fill: new Fill({
            color: 'rgba(200, 210, 230, 0.3)'
          }),
          stroke: new Stroke({
            color: '#6e7377',
            width: 0.5
          })
        }));
      }
    });

    // Create flow lines and markers for countries with traffic data
    const flowLines = [];
    const markers = [];
    
    countriesGeoJSON.features.forEach(feature => {
      const countryName = feature.properties.name;
      const trafficInfo = trafficData[countryName];
      
      if (trafficInfo) {
        // Calculate centroid of the country
        const coords = feature.geometry.coordinates[0][0];
        const centerLon = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
        const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
        
        // Add flow line
        flowLines.push(createFlowLine([centerLon, centerLat], trafficInfo.count));
        
        // Add marker with index
        markers.push(createCountryMarker([centerLon, centerLat], trafficInfo.index));
      }
    });

    // Create layers
    const flowLineLayer = new VectorLayer({
      source: new VectorSource({
        features: flowLines
      })
    });
    
    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features: markers
      })
    });

    
    // Initialize map with lighter OSM layer
    const map = new Map({
      target: mapRef.current,
      controls: defaultControls().extend([
        new ZoomSlider(),
        new Zoom()
      ]),
      layers: [
        new TileLayer({ 
          source: new OSM(),
          opacity: 0.7
        }),
        new VectorLayer({ source: countrySource }),
        flowLineLayer,
        markerLayer
      ],
      view: new View({
        center: fromLonLat([20, 30]), // Centered more on Europe/Africa
        zoom: 2,
        maxZoom: 12,
        minZoom: 1
      })
    });

    // Toggle flow lines based on liveConnections state
    flowLineLayer.setVisible(liveConnections);
    
    return () => map.setTarget(null);
  }, [liveConnections]);

  return (
    <div style={{ position: 'relative', width: "100vw", height: "100vh" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      
      {/* Live connections toggle */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        backgroundColor: 'white',
        padding: '5px 10px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span>Live connections</span>
        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '30px', height: '17px' }}>
          <input 
            type="checkbox" 
            checked={liveConnections} 
            onChange={() => setLiveConnections(!liveConnections)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{ 
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: liveConnections ? '#2196F3' : '#ccc',
            borderRadius: '34px',
            transition: '.4s'
          }}>
            <span style={{
              position: 'absolute',
              content: '',
              height: '13px',
              width: '13px',
              left: liveConnections ? '14px' : '2px',
              bottom: '2px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: '.4s'
            }}></span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default HeatmapMap;