'use client'
import moment from 'moment'
import React from 'react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { api } from '~/trpc/react'

import { getBarPath } from '../utils/getBarPath'

interface ShapeProps {
  x: number
  y: number
  width: number
  height: number
  value: number
  payload: { hour: string }
  chart_data: any
}

const chartConfig = {
  heartbeats: {
    label: 'Heartbeats',
    color: '#008000',
  },
} satisfies ChartConfig

const getLastTwentyFourHoursTimeStamp = () => {
  const now = new Date()

  const last_hours = new Date(now)
  last_hours.setHours(now.getHours() - 24)
  const replace = (_date: Date) => _date.toISOString().replace('T', ' ')
    .substring(0, 19) + '+00'

  const formattedNow = replace(now)
  const formattedLast24 = replace(last_hours)

  const result = [formattedLast24, formattedNow]

  return result
}

const CustomBarShape = (props: ShapeProps) => {
  const { x, y, width, height, value, payload, chart_data } = props
  
  const d = getBarPath(x, y, width, height, value, payload.hour, chart_data)
  return <path d={d} fill={chartConfig.heartbeats.color} />
}

export default function Connectivity({ device_id }: { device_id: string }) {
  const {
    data: record = [{
      hour: '',
      heartbeats: 0,
    }],

  } = api.deviceHeartbeats.getLastHoursStatus.useQuery({
    device_id,
    time_range: getLastTwentyFourHoursTimeStamp(),
  })
  if (!device_id) return null

  return (
    <ChartContainer
      className="h-9 w-44 border border-gray-300"
      config={chartConfig}
      style={{ margin: '2px', padding: '0', borderRadius: '8px' }}
    >
      <ResponsiveContainer className="h-full w-full">
        <BarChart
          barCategoryGap={-4}
          barGap={-4}
          data={record}
          margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
        >
          <XAxis dataKey="hour" hide={true} />
          <YAxis hide={true} />
          {/* <Tooltip />
           */}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter = { (value, name) => {
                  return [`${name}: `, `${value ? 'Active' : 'Inactive'}`]
                }}
                indicator = "dot"
                labelFormatter = { (value) => {
                  return moment(value).format('MM/DD/YYYY HH:mm')
                } }
              />
            }
            cursor={false}
          />
          <Bar
            dataKey="heartbeats"
            fill={chartConfig.heartbeats.color}
            maxBarSize={6}
            minPointSize={0}
            shape={
              (prop: any) => CustomBarShape({ ...prop, chart_data: record }) as any
            }
            strokeWidth={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
