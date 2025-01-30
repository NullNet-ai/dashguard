'use client'

import React from 'react'
import { Bar, BarChart } from 'recharts'

import { type ChartConfig, ChartContainer } from '~/components/ui/chart'

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
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
    <ChartContainer className='min-h-[10px] w-30' config={chartConfig}>
      <BarChart accessibilityLayer={true} data={chartData}>
        <Bar dataKey='desktop' fill='var(--color-desktop)' />
        <Bar dataKey='mobile' fill='var(--color-mobile)' />
      </BarChart>
    </ChartContainer>
  )
}
