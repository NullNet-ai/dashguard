'use client'

import { useMemo } from 'react'

import '@xyflow/react/dist/style.css'

import { useFetchNetworkFlow } from './Provider'
import { generateTimeSeriesData } from './functions/generateTimeSeriesDataPerSeconds'

// import TimelineV2 from './components/TimelineV2'
// import TimelineV3 from './components/TimelineV3'
import TimelineV4 from './components/TimelineV4'
import TrafficSkeleton from './components/TrafficSkeleton'

export default function NetworkFlowView() {
  const { state } = useFetchNetworkFlow();
  const { topTrafficData, recentIPData, pollingIntervalTopTraffic, pollingIntervalRecentIP, loading } = state ?? {} as any;

  const topTrafficFormattedArr = useMemo(() => {
    return (topTrafficData || []).map((el: any) =>
      generateTimeSeriesData(el.result, el.resolution, el.time_count, el.time_unit)
    );
  }, [topTrafficData]);

  const recentIPFormattedArr = useMemo(() => {
    return (recentIPData || []).map((el: any) =>
      generateTimeSeriesData(el.result, el.resolution, el.time_count, el.time_unit)
    );
  }, [recentIPData]);

  if (loading) {
    return (
      <TrafficSkeleton 
        sections={[{ 
          key: 'top_traffic', 
          label: 'Top Traffic', 
          description: 'IPs generating the highest traffic within the selected time range', 
          rows: 5 
        }, 
        { 
          key: 'recent_ip', 
          label: 'Recent IP', 
          description: 'Most recently observed IPs regardless of traffic volume', 
          rows: 10 
        }]} 
      />
    );
  }

  return (
    <TimelineV4
      topTrafficData={topTrafficData}
      topTrafficFormatted={topTrafficFormattedArr}
      recentIPData={recentIPData}
      recentIPFormatted={recentIPFormattedArr}
      pollingIntervalTopTraffic={pollingIntervalTopTraffic}
      pollingIntervalRecentIP={pollingIntervalRecentIP}
    />
  )
}
