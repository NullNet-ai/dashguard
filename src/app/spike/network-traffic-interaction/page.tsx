'use client'
import React, { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "~/trpc/react";

const normalizeTraffic = (traffic, maxTraffic) => {
  if (maxTraffic <= 0) return 0;
  return Math.log(1 + traffic) / Math.log(1 + maxTraffic);
};

const formatBandwidth = (bandwidth) => {
  const bw = parseInt(bandwidth);
  if (bw >= 1000000) return `${(bw / 1000000).toFixed(1)}MB/s`;
  if (bw >= 1000) return `${(bw / 1000).toFixed(1)}KB/s`;
  return `${bw}B/s`;
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

const generateFlowData = (bandwidthData) => {
  const nodes = [];
  const edges = [];
  let maxBandwidth = 0;
  const nodePositions = {};

  bandwidthData.forEach(({ result }) => {
    result.forEach(({ bandwidth }) => {
      const bwValue = parseInt(bandwidth, 10);
      maxBandwidth = Math.max(maxBandwidth, bwValue);
    });
  });

  const addNode = (id, type, label, x, y) => {
    if (!nodePositions[id]) {
      nodePositions[id] = { x, y };
      nodes.push({
        id,
        type: "ipNode",
        position: { x, y },
        data: { label, type },
      });
    }
  };

  bandwidthData.forEach(({ source_ip, destination_ip, result }, index) => {
    const yPosition = index * 150;
    let xPosition = 0;
    const spacing = 150;

    addNode(source_ip, 'source', source_ip, xPosition, yPosition);

    result.forEach(({ bucket, bandwidth }, timeIndex) => {
      const bwValue = parseInt(bandwidth, 10);
      xPosition += spacing;
      
      const trafficNodeId = `traffic-${source_ip}-${destination_ip}-${timeIndex}`;
      nodes.push({
        id: trafficNodeId,
        type: "trafficNode",
        position: { x: xPosition, y: yPosition },
        data: {
          bandwidth: bwValue,
          normalizedValue: normalizeTraffic(bwValue, maxBandwidth),
          tooltip: `${formatTimestamp(bucket)}\n${formatBandwidth(bandwidth)}`,
        },
      });
      
      edges.push({
        id: `edge-${source_ip}-${trafficNodeId}`,
        source: source_ip,
        target: trafficNodeId,
        animated: true,
        style: { strokeWidth: 1 },
      });
    });

    xPosition += spacing;
    addNode(destination_ip, 'destination', destination_ip, xPosition, yPosition);

    edges.push({
      id: `edge-${source_ip}-${destination_ip}`,
      source: source_ip,
      target: destination_ip,
      animated: true,
      style: { strokeWidth: 1 },
    });
  });

  return { nodes, edges };
};

const IPNode = ({ data }) => (
  <div
    className={`rounded-lg border-2 p-4 text-sm font-medium shadow-md
      ${data.type === 'source' 
        ? 'border-black-300 bg-black-100 text-black-800' 
        : 'border-black-300 bg-black-100 text-black-800'}`}
  >
    {data.type === 'source' ? 'Source IP' : 'Destination IP'}
    <div className="mt-1 font-mono text-xs">{data.label}</div>
    <Handle type="source" position="right" />
    <Handle type="target" position="left" />
  </div>
);

const TrafficNode = ({ data }) => {
  const minWidth = 20;
  const maxWidth = 120;
  const width = minWidth + (maxWidth - minWidth) * data.normalizedValue;
  
  return (
    <div
      title={data.tooltip}
      style={{
        width: `${width}px`,
        height: "30px",
        backgroundColor: `rgba(239, 68, 68, ${Math.max(0.2, data.normalizedValue)})`,
        borderRadius: "4px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        color: "white",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {formatBandwidth(data.bandwidth)}
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

export default function NetworkFlow() {
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  
  const { data: packetsIP } = api.packet.fetchPacketsIP.useQuery({});
  const { data: bandwidth } = api.packet.getBandwidthOfSourceIPandDestinationIP.useQuery(
    { packet_data: packetsIP },
    { enabled: !!packetsIP }
  );

  useEffect(() => {
    if (bandwidth) {
      setElements(generateFlowData(bandwidth));
    }
  }, [bandwidth]);

  const nodeTypes = useCallback(
    { ipNode: IPNode, trafficNode: TrafficNode },
    []
  );

  return (
    <div className="h-screen w-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">Network Traffic Visualization</h1>
      <div className="h-[calc(100vh-100px)] w-full rounded-lg border border-gray-200 bg-white shadow-lg">
        <ReactFlow 
          nodes={elements.nodes} 
          edges={elements.edges} 
          nodeTypes={nodeTypes} 
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#f1f5f9" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
