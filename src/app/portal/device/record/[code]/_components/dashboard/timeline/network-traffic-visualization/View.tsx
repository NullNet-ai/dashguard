'use client'
import { ReactFlow, Background } from '@xyflow/react'
import React, { useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { useFetchNetworkFlow } from './Provider'
import { mock_bandwidth } from './functions/mock_bandwidth'

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow()
  const { elements } = state ?? {}

  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  return (
    <div className="py-4">
      <div className="h-full  bg-white relative">
        {/* Scrollable Wrapper */}
        <div className="h-[840px]">
          {/* ReactFlow with larger canvas to allow scrolling */}
          <div className="h-full container-react-flow">
            <ReactFlow
              className="mt-0"
              draggable={true}
              edges={elements?.edges}
              fitView={true}
              maxZoom={1.5}
              minZoom={0.1}
              nodes={elements?.nodes}
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
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  )
}
