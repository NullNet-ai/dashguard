'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'
import { formatBytes } from './function/formatBytes'

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const initialTraffic = 0

const chartConfig = {
  traffic: {
    label: 'Traffic',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const PieChartComponent = ({ defaultValues, interfaces }: IFormProps) => {
  const [trafficData, setTrafficData] = useState({
    traffic: initialTraffic,
    maxTraffic: 100,
  })
  const [animatedTraffic, setAnimatedTraffic] = useState(initialTraffic)

  // Use a ref to store the previous traffic value
  const previousTrafficRef = useRef<number>(initialTraffic)

  const { refetch: fetchBandWidth } = api.packet.getLastBandwithInterfacePerSecond.useQuery(
    {
      bucket_size: '1s',
      timezone,
      device_id: defaultValues?.id,
      time_range: getLastTimeStamp({ count: 2, unit: 'minute', _now: new Date() }) as string[],
      interface_names: interfaces?.map((item: any) => item?.value),
    }, { enabled: false })

  // Fetch traffic data every second
  useEffect(() => {
    if (!defaultValues?.id || defaultValues?.device_status.toLowerCase() === 'offline' || !interfaces?.length) return

    const fetchChartData = async () => {
      try {
        const { data } = await fetchBandWidth()
        const currentTraffic = Number(data) || 0

        // Ensure maxTraffic is always above currentTraffic for proper gauge display
        const maxTraffic = Math.max(currentTraffic * 2 + 100, trafficData.maxTraffic)
        setTrafficData({ traffic: currentTraffic, maxTraffic })
      }
      catch (error) {
        console.error('Error fetching bandwidth data:', error)
      }
    }

    fetchChartData()
    // const interval = setInterval(fetchChartData, 1000)
    // return () => clearInterval(interval)
  }, [defaultValues?.id, defaultValues?.device_status, fetchBandWidth, interfaces])

  // Update previousTrafficRef whenever trafficData.traffic changes
  useEffect(() => {
    previousTrafficRef.current = trafficData.traffic
  }, [trafficData.traffic])

  // Smooth animation effect - update more frequently with smaller steps
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedTraffic((prev) => {
        const diff = trafficData.traffic - prev
        // Use a smaller factor for smoother animation (0.05 instead of 0.1)
        return Math.abs(diff) < 0.1 ? trafficData.traffic : prev + diff * 0.05
      })
    }, 16) // Update at 60fps for smoother animation

    return () => clearInterval(animationInterval)
  }, [trafficData.traffic])

  // Ensure a minimum fill color (1% of maxTraffic)
  const minTrafficFill = Math.max(trafficData.traffic, trafficData.maxTraffic * 0.01);

  // Adjusted pie end angle calculation
  const pieEndAngle = Math.max(5, 180 - (minTrafficFill / trafficData.maxTraffic) * 180);

  // Adjusted arrow rotation (no more stuck needle)
  const arrowRotation = Math.min(90, Math.max(-90, (minTrafficFill / trafficData.maxTraffic) * 180 - 90));

  const previousTraffic = previousTrafficRef.current

  return (
    <ResponsiveContainer height={280} width="100%">
      <div className="flex-1 pb-0 relative">
        <ChartContainer
          className="mx-auto aspect-square max-h-[300px]"
          config={chartConfig}
        >
          <PieChart className="relative z-10" height={300} width={300}>
            <Tooltip content={<ChartTooltipContent hideLabel={true} />} />
            {/* Background gauge */}
            <Pie
              data={[{ name: 'Full', value: trafficData.maxTraffic, fill: '#E5E7EB' }]}
              dataKey="value"
              endAngle={0}
              innerRadius={117} // Increased from 110 by 7
              nameKey="name"
              outerRadius={147} // Increased from 140 by 7
              startAngle={180}
            />
            {/* Traffic gauge */}
            <Pie
              animationBegin={0}
              animationDuration={0}
              data={[{ name: 'Traffic', value: trafficData?.traffic, fill: chartConfig.traffic.color }]}
              dataKey="value"
              endAngle={pieEndAngle}
              innerRadius={117} // Increased from 110 by 7
              nameKey="name"
              outerRadius={147} // Increased from 140 by 7
              startAngle={180}
            />
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
          {/* Gauge needle */}
          <svg
            className="absolute transition-transform duration-[16ms] ease-linear"
            height="300"
            style={{ transform: `rotate(${arrowRotation}deg)` }}
            viewBox="0 0 300 300"
            width="300"
          >
            <polygon fill="black" points="150,45 142,150 158,150" />
            <circle cx="150" cy="150" fill="black" r="8" />
          </svg>
          {/* Traffic value display */}
          <div className="absolute top-[160px] bg-background/80 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-xl font-bold tabular-nums">
              {formatBytes(Math.round(animatedTraffic), 2)}
            </div>
            <div className="text-sm text-gray-500">
              Previous: {formatBytes(Math.round(previousTraffic), 2)}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

export default PieChartComponent