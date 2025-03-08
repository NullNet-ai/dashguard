'use client'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import React, { useState, useEffect, useMemo } from 'react'

import '@xyflow/react/dist/style.css'
import { api } from '~/trpc/react'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { generateFlowData } from './functions/generateFlowData'
import { type Edge, type FlowElement } from './types'
import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange';

export default function NetworkFlow() {
  const [elements, setElements] = useState<{ nodes: FlowElement[], edges: Edge[] }>({ nodes: [], edges: [] })

  // const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  const { data: bandwidth } = api.packet.getBandwidthOfSourceIP.useQuery(
    {
      device_id: '6cb6c156-e8df-461b-83ec-23aee142a664',
      time_range: getLastTimeStamp(1, 'minute'),
    }
  )

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!packetsIP) {
  //       await refetch()
  //     }
  //   }
  //   fetchData().catch(error => console.error('Error fetching data:', error))
  // }, [packetsIP, refetch])



  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  return (
    <></>
    // <div className="p-4">
    //   <div className="h-[calc(100vh-100px)] rounded-lg border border-gray-200 bg-white shadow-lg">
    //     <ReactFlow
    //       defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
    //       edges={elements.edges}
    //       fitView={true}
    //       maxZoom={1.5}
    //       minZoom={0.1}
    //       nodes={elements.nodes}
    //       nodesDraggable={true}
    //       nodeTypes={nodeTypes}
    //     >
    //       <Background color="#f1f5f9" />
    //       <Controls />
    //     </ReactFlow>
    //   </div>
    // </div>
  )
}
