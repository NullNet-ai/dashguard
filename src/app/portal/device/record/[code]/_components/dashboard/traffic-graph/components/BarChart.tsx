'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './AreaChart'

const BarChartComponent = ({ filteredData }: { filteredData: Record<string, any>[] }) => {
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData])
    
  
    const number_of_ticks = useMemo(() => {
       return yAxisMax >= 100000 ? 10 : 5
      },[yAxisMax])
  
  
    const yticks = useMemo(() => {
      if(!yAxisMax)return [0]
      return Array.from({ length: number_of_ticks }, (_, i) => yAxisMin + (i * (yAxisMax - yAxisMin) / (number_of_ticks - 1)))
      
    },[yAxisMax, yAxisMin])
  return (
    <BarChart data={filteredData} height={300} width={1870}>
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
                tickCount={number_of_ticks}
                tickFormatter={formatNumber}
                tickLine={false}
                tickMargin={8}
                ticks={yticks}
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
      <Bar dataKey="bandwidth" fill="var(--color-bandwidth)" />
      {/* <Bar dataKey="static_bandwidth" fill="var(--color-static_bandwidth)" /> */}
      <ChartLegend content={<ChartLegendContent />} />
    </BarChart>
  )
}

export default BarChartComponent
