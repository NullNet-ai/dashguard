'use client'
import React, { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "~/trpc/react";
import { mock_bandwidth } from "./mock_bandwidth";

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

const generateFlowData = (bandwidthData, previousData = {}) => {
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

  const addNode = (id, type, x, y, hasUpdate) => {
    if (!nodePositions[id]) {
      nodePositions[id] = { x, y };
      nodes.push({
        id,
        type: "ipNode",
        position: { x, y },
        data: { label: id, hasUpdate, type },
      });
    }
  };

  bandwidthData.forEach(({ source_ip, destination_ip, result }, index) => {
    const yPosition = index * 150;
    let xPosition = 0;
    const spacing = 150;

    const hasSourceUpdate = previousData[source_ip] !== result;
    const hasDestinationUpdate = previousData[destination_ip] !== result;

    addNode(source_ip, "source", xPosition, yPosition, hasSourceUpdate);

    result.forEach(({ bucket, bandwidth }, timeIndex) => {
      const bwValue = parseInt(bandwidth, 10);
      xPosition += spacing;
      
      const trafficNodeId = `traffic-${source_ip}-${destination_ip}-${timeIndex}`;
      const normalizedValue = normalizeTraffic(bwValue, maxBandwidth);
      const minWidth = 20;
      const maxWidth = 150;
      const width = minWidth + (maxWidth - minWidth) * normalizedValue;
      
      nodes.push({
        id: trafficNodeId,
        type: "trafficNode",
        position: { x: xPosition, y: yPosition },
        data: {
          normalizedValue,
          width,
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
    addNode(destination_ip, "destination", xPosition, yPosition, hasDestinationUpdate);

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
    className={`rounded-lg border-2 p-4 text-sm font-medium shadow-md bg-gray-100 ${data.hasUpdate ? 'border-black-500 text-black-500' : 'border-gray-300 text-gray-800'}`}
  >
    {data.label}
    <Handle type="source" position="right" />
    <Handle type="target" position="left" />
  </div>
);

const TrafficNode = ({ data }) => {
  return (
    <div
      title={data.tooltip}
      style={{
        width: `${data.width}px`,
        height: "30px",
        backgroundColor: `rgba(239, 68, 68, ${Math.max(0.3, data.normalizedValue)})`,
        borderRadius: "4px",
        transition: "all 0.3s ease",
      }}
    >
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

export default function NetworkFlow() {
  // const [elements, setElements] = useState({ nodes: [], edges: [] });
  
  // const { data: packetsIP } = api.packet.fetchPacketsIP.useQuery({});
  // const { data: bandwidth } = api.packet.getBandwidthOfSourceIPandDestinationIP.useQuery(
  //   { packet_data: packetsIP },
  //   { enabled: !!packetsIP }
  // );

  // useEffect(() => {
  //   if (bandwidth) {
  //     setElements(generateFlowData(bandwidth));
  //   }
  // }, [bandwidth]);

  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [data, setData] = useState(mock_bandwidth);
  const [previousData, setPreviousData] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousData(data);
      setData([...mock_bandwidth]);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  useEffect(() => {
    if (data) {
      setElements(generateFlowData(data, previousData));
    }
  }, [data, previousData]);

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
