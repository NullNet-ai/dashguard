'use client'
import React from 'react'
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { type BarProps } from 'recharts/types/cartesian/Bar'
import { type ActiveShape } from 'recharts/types/util/types'

import { type ChartConfig, ChartContainer } from '~/components/ui/chart'

import { chartData, getBarPath } from './utils/getBarPath'

interface ShapeProps {
  x: number
  y: number
  width: number
  height: number
  value: number
  payload: { hour: string }
}

const chartConfig = {
  heartbeats: {
    label: 'Heartbeats',
    color: '#008000',
  },
} satisfies ChartConfig

const CustomBarShape = (props: ShapeProps) => {
  const { x, y, width, height, value, payload } = props
  const d = getBarPath(x, y, width, height, value, payload.hour)
  return <path d={d} fill={chartConfig.heartbeats.color} />
}

export function GridBarGraph() {
  return (
    <ChartContainer
      className="h-9 w-40 border border-gray-300"
      config={chartConfig}
      style={{ margin: '2px', padding: '0', borderRadius: '8px' }}
    >
      <ResponsiveContainer className="h-full w-full">
        <BarChart
          barCategoryGap={-4}
          barGap={-4}
          data={chartData}
          margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
        >
          <XAxis dataKey="hour" hide={true} />
          <YAxis hide={true} />
          <Tooltip />
          <Bar
            dataKey="heartbeats"
            fill={chartConfig.heartbeats.color}
            maxBarSize={6}
            minPointSize={0}
            shape={
              CustomBarShape as unknown as ActiveShape<BarProps, SVGPathElement>
            }
            strokeWidth={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
