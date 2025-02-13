'use client'

import moment from 'moment'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'

const chartConfig = {
  bandwidth: {
    label: 'Bandwidth',
    color: '#60a5fa',
  },
} satisfies ChartConfig

export function BandwidthChart({ chartData }: any) {
  const maxBandwidth = Math.max(...chartData.map((item: any) => item.bandwidth))
  const minBandwidth = Math.min(...chartData.map((item: any) => item.bandwidth))

  const yAxisMax = Math.ceil(maxBandwidth * 1.1)
  const yAxisMin = Math.floor(minBandwidth * 0.9)

  return (
    <Card>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillBandwidth" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="#60a5fa"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="#60a5fa"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="bucket"
              minTickGap={30}
              padding={{ left: 2, right: 2 }}
              tickFormatter={(value: string) => {
                
                return moment(value).format('MM/DD HH:mm')}}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              domain={[yAxisMin, yAxisMax]}
              padding={{ top: 20, bottom: 20 }}
              tickCount={20}
              tickLine={false}
              tickFormatter={(value: number) =>{
                
                return ` ${value}`}}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => moment(value).format('MM/DD HH:mm')}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="bandwidth"
              fill="url(#fillBandwidth)"
              isAnimationActive={false}
              stroke="#60a5fa"
              strokeWidth={2}
              type="monotone"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
