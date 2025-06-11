'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

import '@xyflow/react/dist/style.css'

import { Loader } from '~/components/ui/loader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import { useFetchNetworkFlow } from './Provider'
import { generateTimeSeriesData, generateTimeSeriesDataForLiveData } from './functions/generateTimeSeriesDataPerSeconds'

const rowHeight = 20
const containerHeight = 600 // viewport height for virtualization

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

  // Generate formattedArr for this render
  const formattedArr = (flowData || []).map((el, idx) => {
    const isLive = el.time_count === 1 && el.time_unit === "day" && el.resolution === "1s";
    return isLive
      ? generateTimeSeriesDataForLiveData(el.result, prevFormattedArr[idx])
      : generateTimeSeriesData(el.result, el.resolution, el.time_count, el.time_unit);
  });

  // After render, update prevFormattedArr with the latest formattedArr
  useEffect(() => {
    setPrevFormattedArr(formattedArr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formattedArr)]);

  const totalCount = (flowData || []).length;
  const totalHeight = totalCount * rowHeight;

  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(totalCount - 1, Math.floor((scrollTop + containerHeight) / rowHeight));
  const visibleData = flowData?.slice(startIndex, endIndex + 1) || [];

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", onScroll);
      return () => container.removeEventListener("scroll", onScroll);
    }
  }, [onScroll]);

  if (loading) {
    return (
      <Loader
        className="bg-primary text-primary mt-4"
        label="Fetching unique ips..."
        size="md"
        variant="circularShadow"
      />
    );
  }

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
                        {el.flag && <img alt="Flag" src={el.flag} className="w-[30px] h-[15px]" />}
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