'use client'

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { graphColors } from './graph-color';


export const modifyAxis = (chartData:any) => {
  
  const maxBandwidth = Math.max(
    ...(chartData ?? [])?.map((item: any) => item?.vtnet1 ?? 0),
    ...(chartData ?? [])?.map((item: any) => item?.vtnet0 ?? 0)
  )

  const minBandwidth = Math.min(
    ...(chartData ?? [])?.map((item: any) => item?.vtnet1 ?? Infinity),
    ...(chartData ?? [])?.map((item: any) => item?.vtnet0 ?? Infinity)
  )

  const yAxisMax = Math.ceil(maxBandwidth * 1.25)
  const yAxisMin = Math.floor(minBandwidth * 0.9)

  
  return { yAxisMax, yAxisMin }
}

function formatBytes(bytes:any, decimals = 1) {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export const formatNumber = (num: number) => {
  
  return formatBytes(+num)
  // if(!num) return ''
  // if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  // if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  // if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`

  // return (Math.round(num)).toString()
}


const LineChartComponent = ({ filteredData, interfaces }: any) => {

  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData || []), [filteredData])

  const number_of_ticks = useMemo(() => {
     return yAxisMax >= 100000 ? 10 : 5
    },[yAxisMax])


  const yticks = useMemo(() => {
    if(!yAxisMax)return [0]
    return Array.from({ length: number_of_ticks }, (_, i) => yAxisMin + (i * (yAxisMax - yAxisMin) / (number_of_ticks - 1)))
    
  },[yAxisMax, yAxisMin])
  
  

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
          tickCount={number_of_ticks}
          tickFormatter={formatNumber}
          tickLine={false}
          tickMargin={8}
          ticks={yticks}
        />
      <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
      {interfaces?.map((item: any) => {

        
        return <Line
        dataKey={item?.value}
        dot={false}
        stroke={graphColors[item?.value] ? graphColors[item?.value] : '#16a34a'}
        type="monotone"
        isAnimationActive={false} // disable animation for smooth effect
      />
      })}

    </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartComponent
