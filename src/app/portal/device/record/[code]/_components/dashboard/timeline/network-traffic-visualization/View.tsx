'use client'
import { ReactFlow, Background } from '@xyflow/react'
import React, { useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { useFetchNetworkFlow } from './Provider'

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow()
  const { elements } = state ?? {}

  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  return (
    // <Card className="h-[90vh] w-full p-2 shadow-lg rounded-xl border border-gray-200">
    <div className="py-4 h-full flex flex-col">
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
    // </Card>
  )
}
