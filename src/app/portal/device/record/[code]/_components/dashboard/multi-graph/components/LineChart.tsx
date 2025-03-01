'use client'

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'

export const modifyAxis = (chartData:any) => {
  const maxBandwidth = Math.max(...chartData.map((item: any) => item.vtnet1), ...chartData.map((item: any) => item.vtnet0))
  const minBandwidth = Math.min(...chartData.map((item: any) => item.vtnet1), ...chartData.map((item: any) => item.vtnet0))

  const yAxisMax = Math.ceil(maxBandwidth * 1.1)
  const yAxisMin = Math.floor(minBandwidth * 0.9)

  return { yAxisMax, yAxisMin }
}
export const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}
const LineChartComponent = ({ filteredData, interfaces }: any) => {

  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData])

  return (
    <ResponsiveContainer width="100%" height={300}>
    <LineChart
      accessibilityLayer={true}
      data={filteredData}
      height={300}
      width={1870}
    >
      <CartesianGrid vertical={false} />
      <XAxis
        axisLine={false}
        dataKey="bucket"
        tickFormatter={(value) => {
          const date = new Date(value)
          if (value.includes(':')) {
            return value; // Display time directly if it includes ':'
          }
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        }}
        tickLine={false}
        tickMargin={8}
      />
        <YAxis
          allowDataOverflow={true}
          axisLine={false}
          domain={[yAxisMin, yAxisMax]}
          tickCount={4}
          tickFormatter={formatNumber}
          tickLine={false}
          tickMargin={8}
          ticks={[
            yAxisMin,
            yAxisMin + (yAxisMax - yAxisMin) / 3,
            yAxisMin + (yAxisMax - yAxisMin) * 2 / 3,
            yAxisMax,
          ]}
        />
      <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
      {interfaces?.map((item: any) => {
        return <Line
        dataKey={item?.value}
        dot={false}
        stroke={`var(--color-${item?.value})`}
        strokeWidth={2}
        type="monotone"
      />
      })}
      {/* <Line
        dataKey="bandwidth"
        dot={false}
        stroke="var(--color-bandwidth)"
        strokeWidth={2}
        type="monotone"
      />
      <Line
        dataKey="static_bandwidth"
        dot={false}
        stroke="var(--color-static_bandwidth)"
        strokeWidth={2}
        type="monotone"
      /> */}

    </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartComponent
