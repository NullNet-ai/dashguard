'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'

const BarChartComponent = ({ filteredData }: { filteredData: Record<string, any>[] }) => {
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
