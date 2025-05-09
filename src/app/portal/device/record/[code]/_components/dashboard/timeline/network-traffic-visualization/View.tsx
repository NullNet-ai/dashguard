'use client'
import moment from 'moment'
import React from 'react'

import '@xyflow/react/dist/style.css'
import InfiniteScroll from 'react-infinite-scroll-component'

import { Loader } from '~/components/ui/loader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import { useFetchNetworkFlow } from './Provider'
import { cn } from '~/lib/utils'
// import { generateTimeSeriesData } from './functions/generateTimeSeriesDataPerSeconds'


function generateTimeSeriesData(sampleData: any, resolution: string) {
  const timeMap: any = {};

  if (sampleData.length === 1) {
    const bucketTime = sampleData[0].bucket.split(' ')[1];
    const hour = bucketTime.substring(0, 2);
    const minute = bucketTime.substring(3, 5);

    let timePoints = 0;
    const unit = resolution.slice(-1); // Get the last character (unit: 's', 'm', or 'h')

    switch (unit) {
      case 's': // Seconds
        timePoints = 60;
        for (let i = 0; i < timePoints; i++) {
          const seconds = i.toString().padStart(2, '0');
          const timeKey = `${hour}:${minute}:${seconds}`;
          timeMap[timeKey] = 0;
        }
        break;

      case 'm': // Minutes
        timePoints = 60;
        for (let i = 0; i < timePoints; i++) {
          const minutes = i.toString().padStart(2, '0');
          const timeKey = `${hour}:${minutes}:00`;
          timeMap[timeKey] = 0;
        }
        break;

      case 'h': // Hours
        timePoints = 24;
        for (let i = 0; i < timePoints; i++) {
          const hours = i.toString().padStart(2, '0');
          const timeKey = `${hours}:00:00`;
          timeMap[timeKey] = 0;
        }
        break;

      default:
        console.error("Invalid resolution unit");
        return [];
    }

    const second = bucketTime.substring(6, 8);
    const dataTimeKey =
      unit === 's'
        ? `${hour}:${minute}:${second}`
        : unit === 'm'
        ? `${hour}:${minute}:00`
        : `${hour}:00:00`;

    timeMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
  } else {
    const firstBucket = sampleData[0]?.bucket.split(' ')[1];
    const hour = firstBucket ? firstBucket.substring(0, 2) : '00';
    const minute = firstBucket ? firstBucket.substring(3, 5) : '00';

    let timePoints = 0;
    const unit = resolution.slice(-1);

    switch (unit) {
      case 's': // Seconds
        timePoints = 60;
        for (let i = 0; i < timePoints; i++) {
          const seconds = i.toString().padStart(2, '0');
          const timeKey = `${hour}:${minute}:${seconds}`;
          timeMap[timeKey] = 0;
        }
        break;

      case 'm': // Minutes
        timePoints = 60;
        for (let i = 0; i < timePoints; i++) {
          const minutes = i.toString().padStart(2, '0');
          const timeKey = `${hour}:${minutes}:00`;
          timeMap[timeKey] = 0;
        }
        break;

      case 'h': // Hours
        timePoints = 24;
        for (let i = 0; i < timePoints; i++) {
          const hours = i.toString().padStart(2, '0');
          const timeKey = `${hours}:00:00`;
          timeMap[timeKey] = 0;
        }
        break;

      default:
        console.error("Invalid resolution unit");
        return [];
    }

    sampleData.forEach((item: Record<string, any>) => {
      const bucketTime = item.bucket.split(' ')[1];
      const dataTimeKey =
        unit === 's'
          ? bucketTime
          : unit === 'm'
          ? `${bucketTime.substring(0, 5)}:00`
          : `${bucketTime.substring(0, 2)}:00:00`;

      if (timeMap[dataTimeKey] !== undefined) {
        timeMap[dataTimeKey] = item?.bandwidth ? parseInt(item?.bandwidth) : 0;
      }
    });
  }

  // Convert timeMap to an array
  const timeSeriesArray = Object.keys(timeMap).map((timeKey) => ({
    time: timeKey,
    bandwidth: timeMap[timeKey],
  }));

  return timeSeriesArray;
}

function getMaxBandwidth(data: any[]) {
  let maxBandwidth = 0
  if (!data) return
    data?.forEach((record: Record<string, any>) => {
      const bandwidth = parseInt(record?.bandwidth, 10)
      if (bandwidth > maxBandwidth) {
        maxBandwidth = bandwidth
      }
    })

  return maxBandwidth
}

function getPercentage(value: number, maxValue: number, maxPixels = 300) {
  if (maxValue === 0) return 0
  return (value / maxValue) * maxPixels
}

const getColorForValue = (value: number, maxBandwidth: number) => {
  const range = maxBandwidth / 3; // Divide the max value into 3 ranges

  if(value === undefined) return '#fff'
  if (value < 0) return '#fff'
  if (value === 0) return '#fff' // No color for zero or undefined values
  if (value >= maxBandwidth) {
    return '#00364b'; // Darkest color for the highest range
  }
  else if (value > 2 * range) {
    return '#1d576e'; // Second range
  }
  else if (value > range) {
    return '#325e6f'; // Third range
  }
  else if (value > 0) {
    return '#556971'; // Lowest range
  }
  else {
    return ''; // No color for zero or undefined values
  }
};

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
       <InfiniteScroll
        dataLength={ (flowData || []).length }
        endMessage={ <p style={ { textAlign: 'center' } }></p> }
        hasMore={ unique_source_ips?.length !== flowData?.length }
        loader={unique_source_ips?.length == flowData?.length ? null : <h4>{"Loading..."}</h4> }
        next={ fetchMoreData as any }
        scrollableTarget="scrollableDiv"
        scrollThreshold={ 0.5 }
      >

      {flowData?.map((el, index) => {
        const { flag, name, result, lastBandwidth, resolution, time_count, time_unit } = el
        
        const unit = time_unit

        const formattedTimeFrame = generateTimeSeriesData(result, resolution)
        // const formattedTimeFrame = generateTimeSeriesData(result)
        const maxBandwidth: any = getMaxBandwidth(formattedTimeFrame)

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
                          style={{backgroundColor: getColorForValue(item.bandwidth, maxBandwidth)}}
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
      </InfiniteScroll>
    </div>
  )
}

