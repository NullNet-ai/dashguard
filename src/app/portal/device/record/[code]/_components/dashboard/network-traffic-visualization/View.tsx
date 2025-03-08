'use client'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import React, { useState, useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { useFetchNetworkFlow } from './Provider'

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow()
  console.log('%c Line:13 🍏 state', 'color:#33a5ff', state)
  const { elements } = state ?? {}

  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  return (
    <div className="p-4">
      <div className="h-[calc(100vh-100px)] rounded-lg border border-gray-200 bg-white shadow-lg">
        <ReactFlow
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          edges={elements.edges}
          fitView={true}
          maxZoom={1.5}
          minZoom={0.1}
          nodes={elements.nodes}
          nodesDraggable={true}
          nodeTypes={nodeTypes}
        >
          <Background color="#f1f5f9" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
