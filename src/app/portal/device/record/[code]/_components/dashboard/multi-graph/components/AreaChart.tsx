import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './LineChart';
import { graphColors, sortInterface } from './graph-color';

const AreaChartComponent = ({ filteredData, interfaces }: any) => {

  const sorted = sortInterface(interfaces)

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

  console.log("yticks", yticks)

  return (
    <ResponsiveContainer width="100%" height={300}>
    <AreaChart accessibilityLayer data={filteredData} height={300} width={1870}>
      <defs>
        {sorted?.map((item:any) => {
          const color = graphColors[item?.value] || '#16a34a';
          return (
            <linearGradient key={item.value} id={item?.value} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor={color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={color}
                stopOpacity={0.1}
              />
            </linearGradient>
          )
        })}
      </defs>
      <CartesianGrid vertical={false} />
      {/* <XAxis
        axisLine={false}
        dataKey="bucket"
        // minTickGap={32}
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
      /> */}
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
          tickMargin={3}
          tickCount={4}
          interval="preserveEnd"
          minTickGap={200}
          // padding={{ left: 10, right: 10 }}
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
      {sorted?.map((item: any, index: number) => {
        return (
          <Area
            key={item.value}
            dataKey={item?.value}
            stackId="a"
            stroke={graphColors[item?.value] ? graphColors[item?.value] : '#16a34a'}
            fill={`url(#${item?.value})`}
            type="natural"
            isAnimationActive={false}
          />
        )
      })}
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
