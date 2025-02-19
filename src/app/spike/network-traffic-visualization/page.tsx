'use client'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import React, { useState, useEffect, useMemo } from 'react'

import '@xyflow/react/dist/style.css'
import { api } from '~/trpc/react'

import { generateFlowData } from './generateFlowData'
import IPNode from './IPNode'
import TrafficNode from './TrafficNode'
import { type Edge, type FlowElement } from './types'

export default function NetworkFlow() {
  const [elements, setElements] = useState<{ nodes: FlowElement[], edges: Edge[] }>({ nodes: [], edges: [] })

  const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  const { data: bandwidth } = api.packet.getBandwidthOfSourceIPandDestinationIP.useQuery(
    { packet_data: packetsIP }, { enabled: !!packetsIP }
  )

  useEffect(() => {
    const fetchData = async () => {
      if (packetsIP) {
        await refetch()
      }
    }
    fetchData().catch(error => console.error('Error fetching data:', error))
  }, [packetsIP, refetch])

  useEffect(() => {
    if (bandwidth) {
      setElements(generateFlowData(bandwidth))
    }
  }, [bandwidth])

  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  return (
    <div className="h-screen w-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">Network Traffic Visualization</h1>
      <div className="h-[calc(100vh-100px)] w-full rounded-lg border border-gray-200 bg-white shadow-lg">
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
