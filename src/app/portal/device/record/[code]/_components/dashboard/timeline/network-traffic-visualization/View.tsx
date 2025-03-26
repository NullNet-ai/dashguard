'use client'
import React from 'react'

import '@xyflow/react/dist/style.css'

import { useFetchNetworkFlow } from './Provider'
import { Loader } from '~/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import moment from 'moment'

function getMaxBandwidth(data: any[]) {
  let maxBandwidth = 0;
  if(!data) return ;
  data?.forEach(entry => {
      entry.result.forEach((record: Record<string, any>) => {
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

const getColorForValue = (value: number) => {
  const maxBandwidth = 1000000;
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
  const { flowData, loading } = state ?? {}

  const maxdata: number = getMaxBandwidth(flowData ?? []) ?? 0

  if (loading) return (
    <Loader
      className="bg-primary text-primary"
      label="Fetching data..."
      size="md"
      variant="circularShadow"
    />
  )

  return (
   
    <div className="py-4 h-full flex flex-col">
      <div className="h-full  bg-white relative">
        {/* Scrollable Wrapper */}
        <div className=" ">
          {/* ReactFlow with larger canvas to allow scrolling */}
          <div className="h-full container-react-flow flex flex-col gap-y-2 overflow-x-scroll pb-12">
              {flowData?.map(el => {
                return <div className='flex-row flex items-center'>
                  <> 
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                    <div className='min-w-[200px] flex'>
                    <div className='bg-blue-100 border border-primary text-sm mr-4 font-semibold p-2 rounded-md self-start'>
                      {el?.source_ip}
                    </div>
                    <TooltipContent side="top">
                      <div className="text-lg">
                        <span className='font-bold text-justify'>Country: </span> {" Philippines"}
                      </div>
                      <div className="text-lg">
                        <span className='font-bold text-justify'>Source IP: </span> 
                        { el?.source_ip}
                      </div>
                    </TooltipContent>
                  </div>
                  </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
                  </>
                  <div className='flex flex-row items-center gap-1'>
                      {el?.result?.map((res: Record<string, any>) => {
                        const formattedTime = res.bucket ? moment(res.bucket).tz('UTC').format('HH:mm:ss') : 'Invalid Time'
                        return <>
                        <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger>
                        <div className='rounded-md h-[20px] flex-shrink-0' 
                          style={{
                            width: `${getPercentage(parseInt(res.bandwidth, 10), maxdata)}px`,
                            maxWidth: `${maxWidth}px`,
                            backgroundColor: getColorForValue(Number(res.bandwidth))
                          }}
                        />
                        <TooltipContent side="top">
                          <div className="text-lg">
                          <span className='font-bold text-justify'>Time: </span> {formattedTime}
                          </div>
                          <div className="text-lg">
                          <span className='font-bold text-justify'>Total Bandwidth: </span>  {res.bandwidth}
                          </div>
                        </TooltipContent> 
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>
                      </>
                      })}
                  </div>
                </div>
              })}
          </div>
        </div>
      </div>
    </div>
    
    
  )
}
