'use client'
import moment from 'moment'
import React from 'react'

import '@xyflow/react/dist/style.css'
import InfiniteScroll from 'react-infinite-scroll-component'

import { Loader } from '~/components/ui/loader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import { useFetchNetworkFlow } from './Provider'

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
    return 'red'
  }
  else if (value > maxBandwidth / 2) {
    return 'orange'
  }
  else if (value > maxBandwidth / 5) {
    return 'blue'
  }
  else if (value > maxBandwidth / 10) {
    return 'gray'
  }
  else {
    return '#16a34a'
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
      {/* <InfiniteScroll
        dataLength={ (flowData || []).length }
        endMessage={ <p style={ { textAlign: 'center' } }><b>{"Yay! You have seen it all"}</b></p> }
        hasMore={ true }
        loader={unique_source_ips?.length == flowData?.length ? null : <h4>{"Loading..."}</h4> }
        next={ fetchMoreData as any }
        scrollableTarget="scrollableDiv"
        scrollThreshold={ 0.5 }
      > */}
      {flowData?.map((el, index) => {
        console.log("%c Line:79 🍖 el", "color:#4fff4B", el);
//         "2025-04-24 11:00:00+00" - "2025-04-24 23:42:27+00"
        const { flag, name } = el
        return (
          <div className='flex-row flex items-center' key={index}>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <div className='min-w-[200px] flex'>
                    <div
                      className={`
                        flex gap-1 text-xs mr-4 font-semibold p-1 rounded-md self-start mb-2 items-center h-5
                        ${el.active ? 'bg-red-200 border border-red-500 text-red-800' : 'bg-blue-100 border border-primary text-primary'}
                      `}
                      style={{ fontSize: '0.75rem', minWidth: '150px' }}
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
                    </TooltipContent>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <div className='flex flex-row items-center'>
              {el?.result?.map((res: Record<string, any>) => {
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
                        </TooltipContent>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        )
      })}
      {/* </InfiniteScroll> */}
    </div>
  )
}
