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

export function AreaChartSample({ chartData }: any) {
  return (
    <Card>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart data={
            chartData
          }
          >
            <defs>
              <linearGradient id="fillBandwidth" x1="1" y1="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-bandwidth)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bandwidth)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="second"
              minTickGap={30}
              tickFormatter={(value) => {
                // Only display values that are in the legendLabels array

                // return legendLabels.includes(value) ? value : value;
                return moment(value).format('mm:ss')
              }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickCount={3}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    return moment(value).format('MM/DD HH:mm:ss')
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
