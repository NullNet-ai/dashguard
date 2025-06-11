import { format } from 'date-fns'
import React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'

const chartData = [
  { month: '2025-02-01', WAN: 186, LAN: 80, OPT1: 80 },
  { month: '2025-02-02', WAN: 305, LAN: 200, OPT1: 180 },
  { month: '2025-02-03', WAN: 237, LAN: 120, OPT1: 210 },
  { month: '2025-02-04', WAN: 73, LAN: 190, OPT1: 320 },
  { month: '2025-02-05', WAN: 209, LAN: 130, OPT1: 250 },
  { month: '2025-02-06', WAN: 214, LAN: 140, OPT1: 40 },
  { month: '2025-02-07', WAN: 214, LAN: 140, OPT1: 100 },
]

const chartConfig = {
  WAN: {
    label: 'WAN',
    color: 'darkblue',
  },
  LAN: {
    label: 'LAN',
    color: 'violet',
  },
  OPT1: {
    label: 'OPT1',
    color: 'lightblue',
  },
} satisfies ChartConfig

// Custom legend renderer
const renderLegend = (props: Record<string, any>) => {
  const { payload } = props
  return (
    <ul
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        listStyleType: 'none',
        padding: 0,
        marginTop: '20px',
      }}
    >
      {payload.map((entry: Record<string, any>, index: number) => (
        <li
          key={`item-${index}`}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              backgroundColor: entry.color,
              borderRadius: '50%',
            }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}

export function FirewallChart({ device_id }: { device_id: string }) {


  return (
    <Card>
      <CardHeader className='p-8'>
        <CardTitle>Firewall Info</CardTitle>
        <div className='mt-4 flex gap-4'>
          <CardDescription className='flex gap-4 font-semibold text-foreground'>
            Firewall
            <span className='font-normal'>Primary Firewall</span>
          </CardDescription>
          <CardDescription className='flex gap-4 font-semibold text-foreground'>
            IP Address
            <span className='font-normal'>192.354.890</span>
          </CardDescription>
          <CardDescription className='flex gap-4 font-semibold text-foreground'>
            System Information
            <span className='font-normal'>Placeholder Text</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <ChartContainer className='h-[400px] w-full' config={chartConfig}>
            <LineChart
              accessibilityLayer={true}
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 50,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                axisLine={false}
                dataKey='month'
                tickFormatter={tick => format(new Date(tick), 'd MMM')}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                label={{
                  value: 'Stats',
                  angle: 0,
                  position: 'top',
                  offset: 22,
                  style: {
                    fill: 'var(--color-text)',
                    fontSize: 16,
                    fontWeight: 600,
                  },
                }}
                orientation='left'
                style={{
                  textAnchor: 'middle',
                }}
                tickFormatter={tick => `${tick} MB/s`}
                tickLine={false}
                tickMargin={30}
                ticks={[0, 100, 200, 300, 400]}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              <Line
                dataKey='WAN'
                dot={false}
                stroke='var(--color-WAN)'
                strokeWidth={2}
                type='monotone'
              />
              <Line
                dataKey='LAN'
                dot={false}
                stroke='var(--color-LAN)'
                strokeWidth={2}
                type='monotone'
              />
              <Line
                dataKey='OPT1'
                dot={false}
                stroke='var(--color-OPT1)'
                strokeWidth={2}
                type='monotone'
              />
              <Legend content={renderLegend} />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
