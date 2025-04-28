'use client'
import moment from 'moment'
import React from 'react'

import '@xyflow/react/dist/style.css'
import InfiniteScroll from 'react-infinite-scroll-component'

import { Loader } from '~/components/ui/loader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import { useFetchNetworkFlow } from './Provider'
import { cn } from '~/lib/utils'

function generateTimeSeriesData(sampleData: any) {
  const hourMap: any = {};
  
  for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hourMap[hour] = 0;
  }
  
  sampleData.forEach((item: Record<string, any>) => {
      // Extract hour from the bucket timestamp (format: "2025-04-24 23:00:00")
      const hour = item.bucket.split(' ')[1].substring(0, 2);
      hourMap[hour] = item?.bandwidth ? parseInt(item?.bandwidth) : 0
  });
  
  const result = [];
  for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      result.push({
          time: `${hour}:00:00`,
          bandwidth: hourMap[hour]
      });
  }
  
  return result;
}

function getMaxBandwidth(data: any[]) {
  let maxBandwidth = 0
  if (!data) return
  data?.forEach((entry) => {
    entry.result.forEach((record: Record<string, any>) => {
      const bandwidth = parseInt(record.bandwidth, 10)
      if (bandwidth > maxBandwidth) {
        maxBandwidth = bandwidth
      }
    })
  })

  return maxBandwidth
}

function getPercentage(value: number, maxValue: number, maxPixels = 300) {
  if (maxValue === 0) return 0
  return (value / maxValue) * maxPixels
}

const getColorForValue = (value: number) => {
  const maxBandwidth = 1000000
  if (value >= maxBandwidth) {
    return '#00364b'
  }
  else if (value > maxBandwidth / 100) {
    return '#1d576e'
  }
  else if (value > maxBandwidth / 200) {
    return '#325e6f'
  }
  else if (value > maxBandwidth / 500) {
    return '#556971'
  }
  else if (value === 0) {
    return ''
  }
  else {
    return '#dadddf'
  }
}

const maxWidth = 300

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow()
  const { flowData, loading, fetchMoreData, unique_source_ips } = state ?? {}

  if (loading) return (
    <Loader
      className="bg-primary text-primary"
      label="Fetching data..."
      size="md"
      variant="circularShadow"
    />
  )

  return (
    <div id="scrollableDiv" style={{ height: '80vh', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
      {flowData?.map((el, index) => {
        const { flag, name, result, source_ip, lastBandwidth } = el

        const formattedTimeFrame = generateTimeSeriesData(result)

        return (
          <div className='flex-row flex items-center' key={index}>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <div className='min-w-[250px] flex'>
                    <div
                      className={`
                        flex gap-1 text-xs mr-4 font-semibold p-1 py-[3px] rounded-md self-start mb-[3px] items-center h-5
                        ${el.active ? 'text-red-600' : 'text-black'}
                      `}
                      style={{ 
                        fontSize: '0.75rem', 
                        minWidth: '150px',
                      }}
                    >
                      {flag && (
                        <img
                          alt="Country Flag"
                          src={flag}
                          style={{ width: '35px', height: '15px' }}
                        />
                      )}
                      {' '}
                      {el?.source_ip}
                      {/* {el.active && lastBandwidth && (
                        <span className="ml-2 text-red-600">
                          +{lastBandwidth}
                        </span>
                      )} */}
                    </div>
                    <TooltipContent side="top">
                      <div className="text-lg">
                        <span className='font-bold text-justify'>{'Country: '}</span>
                        {' '}
                        {name}
                      </div>
                      <div className="text-lg">
                        <span className='font-bold text-justify'>{'Source IP: '}</span>
                        {el?.source_ip}
                      </div>
                      {el.active && lastBandwidth && (
                        <div className="text-lg">
                          <span className='font-bold text-justify'>{'New Bandwidth: '}</span>
                          {' '}
                          {lastBandwidth}
                        </div>
                      )}
                    </TooltipContent>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <div className='flex flex-row items-center'>

              {formattedTimeFrame?.map((item, index) => {
                return (
                 
                  <TooltipProvider key={index}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                      <div className={cn(`size-4`)}
                          style={{backgroundColor: getColorForValue(item.bandwidth)}}
                          key={`timeframe-${index}`}
                        />
                        <TooltipContent side="top">
                          <div className="text-lg">
                            <span className='font-bold text-justify'>{'Time: '}</span>
                            {' '}
                            {item?.time}
                            {/* Mars & Ray hanggang sa huli  */}
                          </div>
                          <div className="text-lg">
                            <span className='font-bold text-justify'>{'Total Bandwidth: '}</span>
                            {' '}
                            {item.bandwidth}
                          </div>
                        </TooltipContent>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                
                )
              })}

              {/* {el?.result?.map((res: Record<string, any>) => {
                const formattedTime = res.bucket
                  ? moment(res.bucket).tz('UTC')
                      .format('HH:mm:ss')
                  : 'Invalid Time'
                return (
                  <TooltipProvider key={res.bucket + res.bandwidth}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <div
                          className='rounded-md h-[20px] flex-shrink-0'
                          style={{
                            width: `10px`,
                            maxWidth: `5px`,
                            height: `15px`,
                            backgroundColor: getColorForValue(Number(res.bandwidth)),
                          }}
                        />
                        <TooltipContent side="top">
                          <div className="text-lg">
                            <span className='font-bold text-justify'>{'Time: '}</span>
                            {' '}
                            {formattedTime}
                          </div>
                          <div className="text-lg">
                            <span className='font-bold text-justify'>{'Total Bandwidth: '}</span>
                            {' '}
                            {res.bandwidth}
                          </div>
                          {res.lastAddedBandwidth && (
                            <div className="text-lg">
                              <span className='font-bold text-justify'>{'Last Added: '}</span>
                              {' '}
                              {res.lastAddedBandwidth}
                            </div>
                          )}
                        </TooltipContent>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                )
              })} */}
            </div>
          </div>
        )
      })}
    </div>
  )
}