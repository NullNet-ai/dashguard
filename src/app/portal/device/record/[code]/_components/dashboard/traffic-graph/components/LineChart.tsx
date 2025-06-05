'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './AreaChart'

const LineChartComponent = ({ filteredData }: any) => {
  // Add this to calculate max value
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData || []), [filteredData])
  
    const number_of_ticks = useMemo(() => {
       return yAxisMax >= 100000 ? 10 : 5
      },[yAxisMax])
  
  
    const yticks = useMemo(() => {
      if(!yAxisMax)return [0]
      return Array.from({ length: number_of_ticks }, (_, i) => yAxisMin + (i * (yAxisMax - yAxisMin) / (number_of_ticks - 1)))
      
    },[yAxisMax, yAxisMin])
  return (
    <LineChart
      accessibilityLayer={true}
      data={filteredData}
      height={300} width={1870}
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
        tickCount={number_of_ticks}
        tickFormatter={formatNumber}
        tickLine={false}
        tickMargin={8}
        ticks={yticks}
      />
      <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
      <Line
        dataKey="bandwidth"
        dot={false}
        stroke="var(--color-bandwidth)"
        strokeWidth={2}
        type="monotone"
      />
      {/* <Line
        dataKey="static_bandwidth"
        dot={false}
        stroke="var(--color-static_bandwidth)"
        strokeWidth={2}
        type="monotone"
      /> */}

    </LineChart>
  )
}

export default LineChartComponent
