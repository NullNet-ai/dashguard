'use client'
import React, { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { mock_bandwidth } from "./mock_bandwidth";
import { api } from "~/trpc/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";


const normalizeTraffic = (traffic, maxTraffic) => {
  if (maxTraffic <= 0) return 0;
  return Math.log(1 + traffic) / Math.log(1 + maxTraffic);
};

const formatBandwidth = (bandwidth) => {
  const bw = parseInt(bandwidth);
  return `${(bw / 1000)} KB/s`;
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
      const _maxBandwidth = formatBandwidth(bwValue);
      
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
          _maxBandwidth: parseInt(_maxBandwidth),
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
  const [showTooltip, setShowTooltip] = useState(false);

  const value = data._maxBandwidth;
  const tooltipData = [{ name: "1", value }];

  // Generate dynamic ticks based on the value
  const generateTicks = (value) => {
    const maxValue = Math.ceil(value * 1.2); // Add 20% padding
    const tickCount = 5;
    const ticks = [];
    
    for (let i = 0; i <= tickCount; i++) {
      ticks.push((maxValue / tickCount) * i);
    }
    
    return ticks;
  };

  return (
    <div className="relative group" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={70}>
              <BarChart data={tooltipData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                <XAxis
                  type="number"
                  domain={[0, Math.ceil(value * 1.2)]} // Dynamic domain based on value
                  ticks={generateTicks(value)}
                  tick={{ fontSize: 10, fill: "#333" }}
                  axisLine={{ stroke: "#333" }}
                  tickLine={{ stroke: "#333" }}
                  tickFormatter={(val) => val} // Format ticks to 3 decimal places
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  hide={true}
                />
                <Bar 
                  dataKey="value" 
                  fill="#60a5fa" 
                  radius={[4, 4, 4, 4]}
                  barSize={20}
                >
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    formatter={(val) => val} // Format value to 3 decimal places
                    style={{ 
                      fontSize: '12px',
                      fill: '#333'
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute w-3 h-3 bg-white border-b border-r border-gray-200 -bottom-1.5 left-1/2 -translate-x-1/2 transform rotate-45"></div>
        </div>
      )}

      <div
        className="relative transition-all duration-300 ease-in-out"
        style={{
          width: `${Math.max(50, data.width || 100)}px`,
          height: "36px",
          backgroundColor: `rgba(239, 68, 68, ${Math.max(0.3, data._maxBandwidth / 1000)})`,
          borderRadius: "6px",
          border: "2px solid rgb(239, 68, 68)",
        }}
      >
        <Handle
          type="target"
          position="left"
          className="w-3 h-3 -left-1.5 border-2 bg-white"
        />
        <Handle
          type="source"
          position="right"
          className="w-3 h-3 -right-1.5 border-2 bg-white"
        />
      </div>
    </div>
  );
};


export default function NetworkFlow() {
//   const [elements, setElements] = useState({ nodes: [], edges: [] });
//   const [data, setData] = useState(mock_bandwidth);
//   const [previousData, setPreviousData] = useState({});

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setPreviousData(data);
//       setData([...mock_bandwidth]);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [data]);
//  useEffect(() => {
//     if (data) {
//       setElements(generateFlowData(data, previousData));
//     }
//   }, [data, previousData]);

const [elements, setElements] = useState({ nodes: [], edges: [] });

const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({});
const { data: bandwidth } = api.packet.getBandwidthOfSourceIPandDestinationIP.useQuery(
  { packet_data: packetsIP },
  { enabled: !!packetsIP }
);

useEffect(() => {
  if (packetsIP) {
    refetch();
  }
},[packetsIP, refetch])

useEffect(() => {
  if (bandwidth) {
    setElements(generateFlowData(bandwidth));
  }
}, [bandwidth, refetch]);



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