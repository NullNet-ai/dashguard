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
  const {
    topTrafficData            = [],
    recentIPData              = [],
    pollingIntervalTopTraffic = 0,
    pollingIntervalRecentIP   = 0,
    loading                   = true,
    ipPollTick                = 0,
  } = state ?? {}

  // Single reference time shared across both series so they always cover the same time range.
  // Advances every time the IP poll fires (every 3 s) so the time axis stays current
  // independently of whether the bandwidth data itself changed.
  const sharedNow = useMemo(() => new Date(Date.now() - 325_000), [ipPollTick]);

  const topTrafficFormattedArr = useMemo(() => {
    return (topTrafficData || []).map((el: any) =>
      generateTimeSeriesData(el.result, el.resolution, el.time_count, el.time_unit, sharedNow)
    );
  }, [topTrafficData, sharedNow]);

  const recentIPFormattedArr = useMemo(() => {
    return (recentIPData || []).map((el: any) =>
      generateTimeSeriesData(el.result, el.resolution, el.time_count, el.time_unit, sharedNow)
    );
  }, [recentIPData, sharedNow]);

  const { sortedTopTrafficData, sortedTopTrafficFormattedArr } = useMemo(() => {
    if (!topTrafficFormattedArr.length) {
      return {
        sortedTopTrafficData:        topTrafficData,
        sortedTopTrafficFormattedArr: topTrafficFormattedArr,
      }
    }

    const paired = topTrafficData.map((ip: any, index: number) => {
      const series        = topTrafficFormattedArr[index] ?? []
      const activePackets   = series.filter((entry: any) => Number(entry.bandwidth) > 0).length
      const totalBandwidths = series.reduce((sum: number, entry: any) => sum + Number(entry.bandwidth), 0)
      return { ip, series, activePackets, totalBandwidths }
    })

    paired.sort((a: any, b: any) => {
      const byPackets = b.activePackets - a.activePackets
      return byPackets !== 0 ? byPackets : b.totalBandwidths - a.totalBandwidths
    })

    return {
      sortedTopTrafficData:        paired.map((p: any) => p.ip),
      sortedTopTrafficFormattedArr: paired.map((p: any) => p.series),
    }
  }, [topTrafficData, topTrafficFormattedArr])

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
      topTrafficData={sortedTopTrafficData}
      topTrafficFormatted={sortedTopTrafficFormattedArr}
      recentIPData={recentIPData}
      // @ts-expect-error - No type yet
      recentIPFormatted={recentIPFormattedArr}
      pollingIntervalTopTraffic={pollingIntervalTopTraffic}
      pollingIntervalRecentIP={pollingIntervalRecentIP}
    />
  )
}
