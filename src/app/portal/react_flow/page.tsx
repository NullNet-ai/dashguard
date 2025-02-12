import React from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {edges, nodes } from './config';

const ReactFlowSpike = async () => {
  
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