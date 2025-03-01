'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts'

import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'

const BarChartComponent = ({ filteredData, interfaces }: { filteredData: Record<string, any>[], interfaces: any }) => {
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
        return <Bar dataKey={item.label} fill={`var(--color-${item?.label})`} />})}
      <ChartLegend content={<ChartLegendContent />} />
    </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartComponent
