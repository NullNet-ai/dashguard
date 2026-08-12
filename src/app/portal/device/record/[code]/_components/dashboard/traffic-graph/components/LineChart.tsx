'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './AreaChart'
import { formatBytes } from '../../pie-chart/function/formatBytes'

const LineChartComponent = ({ filteredData }: any) => {
  const formatTooltipValue = (value: unknown) => {
    const numericValue = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(numericValue) ? formatBytes(numericValue) : String(value ?? '')
  }

  const { yAxisMax, yAxisMin } = useMemo(
    () => modifyAxis(filteredData || []),
    [filteredData],
  )
  
    const number_of_ticks = useMemo(() => {
       return yAxisMax >= 100000 ? 10 : 5
      },[yAxisMax])
  
    const yDomain = useMemo(() => {
      if (yAxisMax == null || yAxisMin == null) return ['auto', 'auto']
      if (yAxisMax === 0 && yAxisMin === 0) return [0, 1]
      return [yAxisMin, yAxisMax]
    }, [yAxisMin, yAxisMax])
  
  
    const yticks = useMemo(() => {
      if (yAxisMax == null || yAxisMin == null) return []
      if (yAxisMax === 0 && yAxisMin === 0) return [0]
      const ticks = [yAxisMin]
      for (let i = 1; i < number_of_ticks; i++) {
        ticks.push(
          Math.round(
            yAxisMin + i * ((yAxisMax - yAxisMin) / (number_of_ticks - 1)),
          ),
        )
      }
      return ticks
    }, [yAxisMin, yAxisMax, number_of_ticks])
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        accessibilityLayer={true}
        data={filteredData}
        height={300}
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
      >
        <CartesianGrid vertical={false} />
      <XAxis
        axisLine={false}
        dataKey="bucket"
        interval="preserveStartEnd"
        minTickGap={48}
        padding={{ left: 20, right: 20 }}
        allowDuplicatedCategory={false}
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
        domain={yDomain}
        tickCount={number_of_ticks}
        tickFormatter={(value) => formatNumber(value)}
        tickLine={false}
        tickMargin={8}
        ticks={yticks}
        includeHidden={true}
        minTickGap={0}
        allowDecimals={false}
        scale="linear"
      />
      <ChartTooltip content={<ChartTooltipContent valueFormatter={formatTooltipValue} />} cursor={false} />
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
    </ResponsiveContainer>
  )
}

export default LineChartComponent
