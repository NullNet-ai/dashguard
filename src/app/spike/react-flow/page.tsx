// import React from 'react';
// import { ReactFlow } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';
// import {edges, nodes } from './config';

// const ReactFlowSpike = async () => {
  
//   return (
//     <div className="w-full h-screen bg-gray-50">
//       <ReactFlow 
//         nodes={nodes}
//         //@ts-expect-error - `edges` is not a required prop 
//         edges={edges}
//         fitView
//         fitViewOptions={{ padding: 0.2 }}
//         defaultEdgeOptions={{
//           type: 'smoothstep',
//         }}
//       />
//     </div>
//   );
// };

// export default ReactFlowSpike;
'use client'
import React, { useCallback, useMemo, useState } from 'react';
import  {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
// import {edges as initialEdges, nodes as initialNodes } from './config'
import { api } from '~/trpc/react';

const transformData = (
  packets: { source_ip: string; destination_ip: string }[]
) => {
  const uniqueIPs = [...new Set(packets?.flatMap(packet => [packet.source_ip, packet.destination_ip]))];

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
      border: '1px solid #000000',
      borderRadius: 8,
      padding: '10px',
      backgroundColor: '#f8fafc',
      fontSize: '14px'
    }
  }));

  const edges = packets?.map((packet, index) => ({
    id: `e${index}`,
    source: packet.source_ip,
    target: packet.destination_ip,
    style: { 
      stroke: '#000000',
      strokeWidth: 1.5
    },
    type: 'smoothstep',
    markerEnd: {
      type: 'arrow'
    }
  }));

  return { nodes, edges };
}



export default function FlowDiagram() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const {
    data: record =[],
    refetch,
    error,
  } = api.packet.fetchPacketsIP.useQuery({
  });
  


  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
const {nodes: newNodes, edges: newEdges} = useMemo(() => {const a=  transformData(record)
  
setNodes(a?.nodes || [])
setEdges(a?.edges || [])
return {
  nodes:[],
  edges: []
}

}, [record?.length])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(a) => onConnect(a)}
        fitView
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
