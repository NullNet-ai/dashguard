'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './LineChart';
import { useMemo } from 'react';

const BarChartComponent = ({ filteredData, interfaces }: { filteredData: Record<string, any>[], interfaces: any }) => {
  
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData])
  
  return (
    <ResponsiveContainer width="100%" height={300}>
    <BarChart data={filteredData}>
      <CartesianGrid vertical={false} />
      <XAxis
        axisLine={false}
        dataKey="bucket"
        minTickGap={32}
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
      <ChartTooltip
        content={
          (
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value) => {
                if (value.includes(':')) {
                  return value; // Display time directly if it includes ':'
                }
                return new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
          )
        }
        cursor={false}
      />
      {interfaces?.map((item: any) => {
        return <Bar dataKey={item.value} fill={`var(--color-${item?.value})`}  isAnimationActive={false}/>})}
      <ChartLegend content={<ChartLegendContent />} />
    </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartComponent
