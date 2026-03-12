'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import { Loader } from '~/components/ui/loader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import { useFetchNetworkFlow } from './Provider'
import { generateTimeSeriesData, generateTimeSeriesDataForLiveData } from './functions/generateTimeSeriesDataPerSeconds'
import { FlagIcon } from '@heroicons/react/20/solid'

const rowHeight = 20
const containerHeight = 600 // viewport height for virtualization

// import TimelineV2 from './components/TimelineV2'
// import TimelineV3 from './components/TimelineV3'
import TimelineV4 from './components/TimelineV4'
import TrafficSkeleton from './components/TrafficSkeleton'

function getMaxBandwidth(data: any[]) {
  let maxBandwidth = 0
  if (!data) return 0
  data.forEach((record: Record<string, any>) => {
    const bandwidth = parseInt(record?.bandwidth, 10)
    if (bandwidth > maxBandwidth) {
      maxBandwidth = bandwidth
    }
  })
  return maxBandwidth
}

function getColorForValue(value: number, maxBandwidth: number) {
  const range = maxBandwidth / 3
  if (value === undefined || value <= 0) return '#fff'
  if (value >= maxBandwidth) return '#00364b'
  if (value > 2 * range) return '#1d576e'
  if (value > range) return '#325e6f'
  return '#556971'
}

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow();
  const { flowData, loading } = state ?? {};

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [prevFormattedArr, setPrevFormattedArr] = useState<any[]>([]);

  // Reset prevFormattedArr if flowData length changes
  useEffect(() => {
    if (!flowData) return;
    setPrevFormattedArr((prev) => {
      if (prev.length === flowData.length) return prev;
      return Array(flowData.length).fill(undefined);
    });
  }, [flowData?.length]);

  const formattedArr = useMemo(() => {
    return (flowData || []).map((el, idx) => {
      const isLive = el.time_count === 1 && el.time_unit === "day" && el.resolution === "1s";
      return false // isLive
        ? generateTimeSeriesDataForLiveData(el.result, prevFormattedArr[idx])
        : generateTimeSeriesData(el.result, el.resolution, el.time_count, el.time_unit);
    });
  }, [flowData]);

  // After render, update prevFormattedArr with the latest formattedArr
  useEffect(() => {
    setPrevFormattedArr(formattedArr);
  }, [formattedArr]);

  const totalCount = (flowData || []).length;
  const totalHeight = totalCount * rowHeight;

  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(totalCount - 1, Math.floor((scrollTop + containerHeight) / rowHeight));
  const visibleData = flowData?.slice(startIndex, endIndex + 1) || [];

  if (loading) {
    return (
      <TrafficSkeleton sections={[{ label: 'Top Traffic', rows: 3 }, { label: 'Recent IPs', rows: 5 }]} />
    );
  }


  return <TimelineV4 flowData={flowData} formatted={formattedArr} />
  // return <TimelineV3 flowData={flowData} formatted={formattedArr} />
  // return <TimelineV2 flowData={flowData} formatted={formattedArr} />

  return (
    <div
      ref={containerRef}
      style={{
        height: `${containerHeight}px`,
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
        border: "1px solid #ddd",
      }}
      className="custom-scrollbar mt-10"
    >
      <div style={{ height: `${totalHeight}px`, position: "relative", minWidth: "1000px" }}>
        {flowData?.map((el, index) => {
          const formatted = formattedArr[index] || [];
          const maxBandwidth = getMaxBandwidth(formatted);

          return (
            <div
              key={el.source_ip}
              className="flex items-start gap-2 px-2 py-1"
              style={{
                position: "absolute",
                top: `${index * rowHeight}px`,
                left: 0,
                right: 0,
                height: `${rowHeight}px`,
              }}
            >
              <div className="flex min-w-[200px] items-center gap-2 text-xs font-semibold">
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        {el.flag ? el.flag === '/unknown-flag.svg' ? <div
                          className="flex size-4 items-center justify-center"
                          style={{
                            backgroundColor: '#efefef',
                          }}
                        >
                          <FlagIcon className='size-2'/>
                        </div> : <img alt="Flag" src={el.flag} className="w-[30px] h-[15px]" /> : null}
                        <span className={el.active ? "text-red-600" : "text-black"}>{el.source_ip}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-sm">
                        <div>
                          <strong>Country:</strong> {el.name}
                        </div>
                        <div>
                          <strong>Source IP:</strong> {el.source_ip}
                        </div>
                        {el.active && el.lastBandwidth && (
                          <div>
                            <strong>New Bandwidth:</strong> {el.lastBandwidth}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center]">
                {/* TODO: Add pagination for long time series. Temporary, slice 0-1000 */}
                {formatted.map((item: Record<string, any>, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <div
                          className="size-4"
                          style={{
                            backgroundColor: getColorForValue(item.bandwidth, maxBandwidth),
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="text-xs">
                          <div>
                            <strong>Time:</strong> {item?.bucketTime || item.time}
                          </div>
                          <div>
                            <strong>Bandwidth:</strong>{" "}
                            {item.bandwidth > 1024
                              ? (item.bandwidth / 1024).toFixed(2) + " KB"
                              : item.bandwidth + " bytes"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}