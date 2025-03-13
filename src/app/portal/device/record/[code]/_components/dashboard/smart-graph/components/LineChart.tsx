'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'

const LineChartComponent = ({ filteredData }: any) => {
  // Add this to calculate max value
  const maxValue = Math.max(...filteredData.map((item: any) => 
    parseInt(item.bandwidth, 10) || 0
  ));

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
        tickLine={false}
        tickMargin={12}
        tickFormatter={(value) => {
          if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
          if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
          return value.toString()
        }}
        domain={[0, maxValue + (maxValue/ 10)]} // Use the calculated maxValue
        tickCount={6}
        width={60}
        scale="linear"
        hide={true}
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
