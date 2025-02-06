'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'


const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  bandwidth: {
    label: 'Bandwidth',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function AreaChartSample({chartData}: any) {
  const [timeRange, setTimeRange] = useState('90d')

  // const [chartData, setChartData] = useState(_chartData)

  useEffect(() => {
    // setInterval(() => {
    //   const data = [
    //     ...chartData,
    //     {
    //       second: (chartData?.length + 1) + '',
    //       bandwidth: Math.floor(Math.random() * 500),
    //     },
    //   ]
    //   setChartData(data)
    // }, 1000)
  }, [])

  return (
    <Card>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillBandwidth" x1="1" y1="1" >
                <stop
                  offset="0%"
                  stopColor="var(--color-bandwidth)"
                  stopOpacity={0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bandwidth)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="1" x2="1" y1="1" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="second"
              // minTickGap={32}
              // tickFormatter={(value) => {
              //   const second = new Date(value)
              //   return second.toLocaleDateString('en-US', {
              //     month: 'short',
              //     day: 'numeric',
              //   })
              // }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine = { false }
              tickCount = { 3 }
              tickLine = { false }
              tickMargin = { 8 }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="bandwidth"
              fill="url(#fillBandwidth)"
              stackId="a"
              stroke="var(--color-bandwidth)"
              type="natural"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
