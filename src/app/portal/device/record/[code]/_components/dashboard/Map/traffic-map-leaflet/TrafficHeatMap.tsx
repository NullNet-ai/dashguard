"use client"; // Required for Next.js 13+ (App Router)

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const HeatMapLayer = ({ points }: Record<string,any>) => {
  const map = useMap();

  useEffect(() => {
    if (typeof window !== "undefined" && map && points.length) {
      import("leaflet.heat").then(({ default: heat }) => {
        const heatLayer = heat.heatLayer(points, {
          radius: 20,
          blur: 25,
          maxZoom: 10,
          gradient: { 0.2: "blue", 0.5: "lime", 0.8: "yellow", 1: "red" },
        });
        heatLayer.addTo(map);
      });
    }
  }, [map, points]);

  return null;
};

const TrafficHeatMap = () => {
  const heatmapPoints = [
    [14.5995, 120.9842, 0.9], // Manila
    [48.8566, 2.3522, 0.7],   // Paris
    [51.5074, -0.1278, 0.6],  // London
    [52.5200, 13.4050, 0.8],  // Berlin
    [35.6895, 139.6917, 0.5], // Tokyo
  ];

  const trafficRoutes = [
    { from: [14.5995, 120.9842], to: [48.8566, 2.3522] },  // Manila → Paris
    { from: [14.5995, 120.9842], to: [51.5074, -0.1278] }, // Manila → London
    { from: [14.5995, 120.9842], to: [52.5200, 13.4050] }, // Manila → Berlin
    { from: [14.5995, 120.9842], to: [35.6895, 139.6917] } // Manila → Tokyo
  ];

  return (
    <MapContainer center={[20, 0]} zoom={3} style={{ height: "600px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Heatmap Layer */}
      <HeatMapLayer points={heatmapPoints} />

      {/* Traffic Flow Lines */}
      {trafficRoutes.map((route: Record<string,any>, idx) => (
        <Polyline key={idx} positions={[route?.from, route?.to]} color="orange" weight={2} dashArray="5,10" />
      ))}

      {/* City Markers */}
      {heatmapPoints.map((point: number[] | any, idx) => (
        <CircleMarker key={idx} center={[point?.[0], point?.[1]]} radius={5} fillOpacity={0.7} color="red" />
      ))}
    </MapContainer>
  );
};

export default TrafficHeatMap;
