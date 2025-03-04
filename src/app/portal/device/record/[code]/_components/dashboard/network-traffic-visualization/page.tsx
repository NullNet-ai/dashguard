'use client'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import React, { useState, useEffect, useMemo } from 'react'

import '@xyflow/react/dist/style.css'
import { api } from '~/trpc/react'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { type Edge, type FlowElement } from './types'
import { generateFlowData } from './functions/generateFlowData'

export default function NetworkFlow() {
  const [elements, setElements] = useState<{ nodes: FlowElement[], edges: Edge[] }>({ nodes: [], edges: [] })

  const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  console.log("%c Line:17 🍖 packetsIP", "color:#33a5ff", packetsIP);
  const { data: bandwidth } = api.packet.getBandwidthOfSourceIPandDestinationIP.useQuery(
    { packet_data: packetsIP }, { enabled: !!packetsIP }
  )
  
  console.log("%c Line:18 🥟 bandwidth", "color:#e41a6a", bandwidth);
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
