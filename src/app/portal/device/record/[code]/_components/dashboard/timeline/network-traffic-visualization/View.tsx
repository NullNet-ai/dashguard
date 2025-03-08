'use client'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import React, { useState, useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { generateFlowData } from './functions/generateFlowData'
import { mock_bandwidth } from './functions/mock_bandwidth'
import { useFetchNetworkFlow } from './Provider'

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow()
  const { elements } = state

  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  return (
    <div className="py-4 h-[calc(100vh-100px)]">
      <div className="h-full rounded-lg border border-gray-200 bg-white shadow-lg relative">
        {/* Scrollable Wrapper */}
        <div className="h-[810px] overflow-auto">
          {/* ReactFlow with larger canvas to allow scrolling */}
          <div className="w-[3500px] h-[4500px]">
            <ReactFlow
              className="mt-0"
              draggable={true}
              edges={elements.edges}
              fitView={true}
              maxZoom={1.5}
              minZoom={0.1}
              nodes={elements.nodes}
              nodesDraggable={true}
              nodeTypes={nodeTypes}
              viewport={{
                x: 30,
                y: 30,
                zoom: 0.5,
              }}
              zoomOnScroll={false}
            >
              <Background color="#f1f5f9" />
              {/* <Controls /> */}
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  )
}
