'use client'
import React, { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "~/trpc/react";

// Normalize traffic data using a logarithmic scale for better contrast
const normalizeTraffic = (traffic, maxTraffic) => (maxTraffic > 0 ? Math.log(1 + traffic) / Math.log(1 + maxTraffic) : 0);

// Maintain stable Y positions for IPs across updates
const ipPositions = {};

// Generate heatmap with both source and destination IPs
const generateHeatmapData = (packetData) => {
  const nodes = [];
  const labels = [];
  const currentTime = Date.now();

  const trafficMap = {};
  let maxTraffic = 0;

  packetData.forEach(packet => {
    const { source_ip, destination_ip, timestamp } = packet;
    const timeDiff = Math.max(1, (currentTime - new Date(timestamp).getTime()) / 1000); // Convert ms to seconds
    
    trafficMap[source_ip] = (trafficMap[source_ip] || 0) + 1 / timeDiff; // Inverse time difference as traffic measure
    trafficMap[destination_ip] = (trafficMap[destination_ip] || 0) + 1 / timeDiff;

    maxTraffic = Math.max(maxTraffic, trafficMap[source_ip], trafficMap[destination_ip]);
  });

  const ipList = Object.keys(trafficMap);

  ipList.forEach((ip, index) => {
    const traffic = trafficMap[ip] * 1024; // Convert to KB/s
    const normalizedTraffic = normalizeTraffic(traffic, maxTraffic * 1024);
    const isSource = packetData.some(p => p.source_ip === ip);
    const labelColor = isSource ? "#e60000" : "#000000"; // Red for source, Black for destination
    
    // Assign stable Y position for each IP
    if (!ipPositions[ip]) {
      ipPositions[ip] = index * 30;
    }

    labels.push({
      id: `label-${index}`,
      type: "labelNode",
      position: { x: -330, y: ipPositions[ip] },
      data: { label: `${ip} ( ${traffic.toFixed(1)} KB/s )`, color: labelColor },
    });

    nodes.push({
      id: `heatmap-${index}`,
      type: "customNode",
      position: { x: 10 + 100 * normalizedTraffic, y: ipPositions[ip] },
      data: { intensity: normalizedTraffic, tooltip: `${ip}: ${traffic.toFixed(1)} KB/s` },
    });
  });

  return [...labels, ...nodes];
};

// Custom heatmap cell
const HeatmapNode = ({ data }) => (
  <div
    title={data.tooltip}
    style={{
      width: `${100 * data.intensity}px`,
      height: "20px",
      backgroundColor: `rgba(139, 0, 0, ${data.intensity})`,
      borderRadius: "3px",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "black",
        color: "white",
        padding: "2px 5px",
        borderRadius: "3px",
        fontSize: "12px",
        visibility: "hidden",
        whiteSpace: "nowrap"
      }}
      className="tooltip"
    >
      {data.tooltip}
    </div>
  </div>
);

// Custom label node
const LabelNode = ({ data }) => (
  <div
    style={{
      fontSize: "14px",
      fontWeight: "bold",
      fontFamily: "monospace",
      color: data.color,
      width: "140px",
      textAlign: "right",
      paddingRight: "20px",
      whiteSpace: "nowrap",
    }}
  >
    {data.label}
  </div>
);

export default function HeatmapFlow() {
  const [nodes, setNodes] = useState([]);
  const [prevData, setPrevData] = useState(null);
  const { refetch } = api.packet.fetchPacketsIP.useQuery({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await refetch();
      if (response.data && JSON.stringify(response.data) !== JSON.stringify(prevData)) {
        setPrevData(response.data);
        setNodes(generateHeatmapData(response.data));
      }
    };

    fetchData(); // Fetch immediately
    const interval = setInterval(fetchData, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup
  }, [refetch, prevData]);

  const nodeTypes = useCallback(
    { customNode: HeatmapNode, labelNode: LabelNode },
    []
  );

  return (
    <div style={{ width: "100vw", height: "100vh", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Network Traffic Visualization</h1>
      <ReactFlow nodes={nodes} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
