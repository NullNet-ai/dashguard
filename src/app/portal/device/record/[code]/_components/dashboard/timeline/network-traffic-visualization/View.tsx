'use client'
import { ReactFlow, Background } from '@xyflow/react'
import React, { useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import IPNode from './components/IPNode'
import TrafficNode from './components/TrafficNode'
import { useFetchNetworkFlow } from './Provider'
import { Loader } from '~/components/ui/loader';

function getMaxBandwidth(data: any[]) {
  let maxBandwidth = 0;

  data.forEach(entry => {
      entry.result.forEach(record => {
          const bandwidth = parseInt(record.bandwidth, 10);
          if (bandwidth > maxBandwidth) {
              maxBandwidth = bandwidth;
          }
      });
  });

  return maxBandwidth;
}

function getPercentage(value: number, maxValue: number, maxPixels = 300) {
  if (maxValue === 0) return 0; // Avoid division by zero
  return (value / maxValue) * maxPixels;
}

const getColorForValue = (value: number, maxBandwidth: number) => {
  console.log("value", value)
  if (value >= maxBandwidth) {
    return 'red'
  } else if (value > maxBandwidth / 2) {
    return 'orange'
  } else if (value > maxBandwidth / 5) {
    return 'blue'
  } else if (value > maxBandwidth / 10) {
    return 'gray'
  } else {
    return '#16a34a'
  }
}

const maxWidth = 300;

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow()
  const { elements, loading } = state ?? {}

  const nodeTypes = useMemo(
    () => ({ ipNode: IPNode, trafficNode: TrafficNode }), []
  )

  
  const maxdata = getMaxBandwidth(elements ?? [])
  
  console.log("elements?.edges", elements)
  

  if (loading) return (
    <Loader
      className="bg-primary text-primary"
      label="Fetching data..."
      size="md"
      variant="circularShadow"
    />
  )

  return (
    // <Card className="h-[90vh] w-full p-2 shadow-lg rounded-xl border border-gray-200">
    <div className="py-4 h-full flex flex-col">
      <div className="h-full  bg-white relative">
        {/* Scrollable Wrapper */}
        <div className=" ">
          {/* ReactFlow with larger canvas to allow scrolling */}
          <div className="h-full container-react-flow flex flex-col gap-y-2 overflow-x-scroll pb-12">
              {elements?.map(el => {
                return <div className='flex-row flex items-center'>
                  <div className='min-w-[200px] flex'>
                    <div className='bg-blue-100 border border-primary text-sm mr-4 font-semibold p-2 rounded-md self-start'>
                      {el?.source_ip}
                    </div>
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                      {el?.result?.map(res => {
                        return <div className='rounded-md h-[20px] flex-shrink-0' 
                          style={{
                            width: `${getPercentage(parseInt(res.bandwidth, 10), maxdata)}px`,
                            maxWidth: `${maxWidth}px`,
                            backgroundColor: getColorForValue(Number(res.bandwidth),  Number(maxdata))
                          }}
                        />
                      })}
                  </div>
                </div>
              })}
          </div>
        </div>
      </div>
    </div>
    // </Card>
  )
}
