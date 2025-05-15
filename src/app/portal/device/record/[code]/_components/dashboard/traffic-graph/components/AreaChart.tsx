import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

export const modifyAxis = (chartData:any) => {
  
  const maxBandwidth = Math.max(
    ...(chartData ?? [])?.map((item: any) => item?.bandwidth ?? 0)
  )

  const minBandwidth = Math.min(
    ...(chartData ?? [])?.map((item: any) => item?.bandwidth ?? Infinity)
  )

  const yAxisMax = Math.ceil(maxBandwidth * 1.25)
  const yAxisMin = Math.floor(minBandwidth * 0.9)

  
  return { yAxisMax, yAxisMin }
}

export const formatNumber = (num: number) => {
  
  if(!num) return ''
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`

  return (Math.round(num)).toString()
}
const AreaChartComponent = ({ filteredData }: { filteredData: Record<string, any>[] }) => {

  

  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData])
  
    const number_of_ticks = useMemo(() => {
      return yAxisMax >= 100000 ? 10 : 5
     },[yAxisMax])
  
  
     const yticks = useMemo(() => {
      if(!yAxisMax) return [0]
      // Create an array with 0 as first tick and evenly distribute the rest
      const ticks = [0];
      for (let i = 1; i < number_of_ticks; i++) {
        ticks.push(Math.round(i * (yAxisMax / (number_of_ticks - 1))));
      }
      return ticks;
    },[yAxisMax, number_of_ticks])
  return (
    <AreaChart data={filteredData}
    height={300} width={1870}
    >
      <defs>
        <linearGradient id="fillBandwidth" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--color-bandwidth)"
            stopOpacity={0.8}
          />
          <stop
            offset="95%"
            stopColor="var(--color-bandwidth)"
            stopOpacity={0.1}
          />
        </linearGradient>
        {/* <linearGradient id="fillStaticBandwidth" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--color-static_bandwidth)"
            stopOpacity={0.8}
          />
          <stop
            offset="95%"
            stopColor="var(--color-static_bandwidth)"
            stopOpacity={0.1}
          />
        </linearGradient> */}
      </defs>
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
          domain={[0, yAxisMax]} // Force starting from 0
          tickCount={number_of_ticks}
          tickFormatter={(value) => value === 0 ? '0' : formatNumber(value)} // Explicitly format 0
          tickLine={false}
          tickMargin={8}
          ticks={yticks}
          includeHidden={true}
          minTickGap={0}
          allowDecimals={false}
          scale="linear"
          padding={{ bottom: 10 }} // Add padding to ensure 0 is visible
          // label={{ value: '0', position: 'insideBottom', offset: -5, fill: '#666' }} // Add explicit 0 label
        />
      <ChartTooltip
        content={(
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
        )}
        cursor={false}
      />
      <Area
        dataKey="bandwidth"
        fill="url(#fillBandwidth)"
        stackId="a"
        stroke="var(--color-bandwidth)"
        type="monotone"
        isAnimationActive={false}
      />
      {/* <Area
        dataKey="static_bandwidth"
        fill="url(#fillStaticBandwidth)"
        stackId="a"
        stroke="var(--color-static_bandwidth)"
        type="natural"
      /> */}
      <ChartLegend content={<ChartLegendContent />} />
    </AreaChart>
  )
}

export default AreaChartComponent
