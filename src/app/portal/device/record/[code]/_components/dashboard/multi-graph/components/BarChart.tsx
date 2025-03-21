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
import { graphColors } from './graph-color';

const BarChartComponent = ({ filteredData, interfaces }: { filteredData: Record<string, any>[], interfaces: any }) => {
  
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData])
  

  const number_of_ticks = useMemo(() => {
     return yAxisMax >= 100000 ? 10 : 5
    },[yAxisMax])


  const yticks = useMemo(() => {
    if(!yAxisMax)return [0]
    return Array.from({ length: number_of_ticks }, (_, i) => yAxisMin + (i * (yAxisMax - yAxisMin) / (number_of_ticks - 1)))
    
  },[yAxisMax, yAxisMin])


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
      {interfaces?.map((item: any) => {
        return <Bar dataKey={item.value} fill={graphColors[item?.value] ? graphColors[item?.value] : '#16a34a'}  isAnimationActive={false}/>})}
      <ChartLegend content={<ChartLegendContent />} />
    </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartComponent
