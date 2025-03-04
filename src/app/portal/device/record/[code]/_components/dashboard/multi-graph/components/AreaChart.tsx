import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './LineChart';

const AreaChartComponent = ({ filteredData, interfaces }: any) => {
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData])

  return (
    <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={filteredData} height={300} width={1870}>
      <defs>
        {interfaces?.map((item:any) => {
          return <linearGradient id={`${item?.value}`} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="5%"
            stopColor={`var(--color-${item?.value})`}
            stopOpacity={0.8}
          />
          <stop
            offset="95%"
            stopColor={`var(--color-${item?.value})`}
            stopOpacity={0.1}
          />
        </linearGradient>})}
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
      {interfaces?.map((item: any) => <Area
        dataKey={item?.value}
        fill={`url(#fill${item?.value})`}
        stackId="a"
        stroke={`var(--color-${item.value})`}
        type="natural"
        isAnimationActive={false}
      />)}
      {/* <Area
        dataKey="static_bandwidth"
        fill="url(#fillStaticBandwidth)"
        stackId="a"
        stroke="var(--color-static_bandwidth)"
        type="natural"
      /> */}
      <ChartLegend content={<ChartLegendContent />} />
    </AreaChart></ResponsiveContainer>
  )
}

export default AreaChartComponent
