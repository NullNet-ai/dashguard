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

  const minuteMap: any = {};
  
  // Handle the case when there's only a single data point
  if (sampleData.length === 1) {
    // Extract hour from the single data point
    const bucketTime = sampleData[0].bucket.split(' ')[1]; // Extract "HH:mm:ss"
    const hour = bucketTime.substring(0, 2); // Extract hour

    // Initialize minuteMap with all minutes in the hour set to 0
    for (let i = 0; i < 60; i++) {
      const minutes = i.toString().padStart(2, '0');
      const timeKey = `${hour}:${minutes}:00`;
      minuteMap[timeKey] = 0;
    }
    
    // Set the bandwidth value for the specific minute from the data point
    const minute = bucketTime.substring(3, 5); // Extract minute
    const dataTimeKey = `${hour}:${minute}:00`;
    minuteMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
  } else {
    // Original logic for multiple data points
    // Dynamically determine the hour from the first data point
    const firstBucket = sampleData[0]?.bucket.split(' ')[1]; // Extract "HH:mm:ss"
    const hour = firstBucket ? firstBucket.substring(0, 2) : '00'; // Extract "HH" or default to "00"

    // Initialize the minuteMap with all minutes in the determined hour set to 0
    for (let i = 0; i < 60; i++) {
      const minutes = i.toString().padStart(2, '0');
      const timeKey = `${hour}:${minutes}:00`; // Use the determined hour
      minuteMap[timeKey] = 0;
    }

    // Populate the minuteMap with sample data
    sampleData.forEach((item: Record<string, any>) => {
      const bucketTime = item.bucket.split(' ')[1]; // Extract "HH:mm:ss"
      const timeKey = bucketTime.substring(0, 5) + ':00'; // Format as "HH:mm:00"
      if (minuteMap[timeKey] !== undefined) {
        minuteMap[timeKey] = item?.bandwidth ? parseInt(item?.bandwidth) : 0;
      }
    });
  }

  // Generate the result array
  const result = [];
  // Sort the keys to ensure chronological order
  const sortedKeys = Object.keys(minuteMap).sort();
  for (const timeKey of sortedKeys) {
    result.push({
      time: timeKey,
      bandwidth: minuteMap[timeKey],
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
        const { flag, name, result, lastBandwidth } = el

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

