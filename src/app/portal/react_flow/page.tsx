import React from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '~/trpc/server';

const ReactFlowSpike = async () => {
  const packets = await api.packet.fetchPacketsIP({});

  // Get unique IPs for nodes
  const uniqueIPs = [...new Set(packets?.flatMap(packet => [packet.source_ip, packet.destination_ip]))];

  // Create nodes in a grid layout
  const GRID_SPACING = 250;
  const GRID_COLUMNS = Math.ceil(Math.sqrt(uniqueIPs.length));
  
  const nodes = uniqueIPs.map((ip, index) => ({
    id: ip,
    position: {
      x: (index % GRID_COLUMNS) * GRID_SPACING,
      y: Math.floor(index / GRID_COLUMNS) * GRID_SPACING
    },
    data: { label: ip },
    style: {
      width: 180,
      height: 40,
      border: '1px solid #2563eb',
      borderRadius: 8,
      padding: '10px',
      backgroundColor: '#f8fafc',
      fontSize: '14px'
    }
  }));

  // Create edges between connected IPs
  const edges = packets?.map((packet, index) => ({
    id: `e${index}`,
    source: packet.source_ip,
    target: packet.destination_ip,
    animated: true,
    style: { 
      stroke: '#2563eb',
      strokeWidth: 1.5
    },
    type: 'smoothstep',
    markerEnd: {
      type: 'arrow',
    }
  }));

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow 
        nodes={nodes}
        //@ts-expect-error - `edges` is not a required prop 
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      />
    </div>
  );
};

export default ReactFlowSpike;