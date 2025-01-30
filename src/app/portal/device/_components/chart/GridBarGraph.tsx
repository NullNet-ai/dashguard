'use client'

import React from 'react'
import { Bar, BarChart } from 'recharts'

import { type ChartConfig, ChartContainer } from '~/components/ui/chart'

const chartData = [
  { hour: 1, desktop: 100 },
  { hour: 2, desktop: 100 },
  { hour: 3, desktop: 100 },
  { hour: 4, desktop: 100 },
  { hour: 5, desktop: 100 },
  { hour: 6, desktop: 100 },
  { hour: 7, desktop: 100 },
  { hour: 8, desktop: 100 },
  { hour: 9, desktop: 100 },
  { hour: 10, desktop: 100 },
  { hour: 11, desktop: 100 },
  { hour: 12, desktop: 100 },
  { hour: 13, desktop: 100 },
  { hour: 14, desktop: 0 },
  { hour: 15, desktop: 0 },
  { hour: 16, desktop: 100 },
  { hour: 17, desktop: 100 },
  { hour: 18, desktop: 100 },
  { hour: 19, desktop: 100 },
  { hour: 20, desktop: 100 },
  { hour: 21, desktop: 100 },
  { hour: 22, desktop: 100 },
  { hour: 23, desktop: 100 },
  { hour: 24, desktop: 100 },

]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#008000',
  },
  mobile: {
    label: 'Mobile',
    color: '#008000',
  },
} satisfies ChartConfig

export function GridBarGraph() {
  return (
    <ChartContainer
      className='h-9 w-40 border border-gray-300'
      config={chartConfig}
      style={{ padding: '2px', margin: 0 }}
    >
      <BarChart
        accessibilityLayer={true}
        data={chartData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Bar dataKey='desktop' fill='var(--color-desktop)' />
      </BarChart>
    </ChartContainer>
  )
}
