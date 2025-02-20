"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "~/components/ui/chart"

const chartData = [
  { country: "USA", wan: 222, lan: 150, opt1: 150 },
  { country: "Canada", wan: 97, lan: 180, opt1: 150 },
  { country: "Germany", wan: 167, lan: 120, opt1: 150 },
  { country: "France", wan: 242, lan: 260, opt1: 150 },
  { country: "UK", wan: 373, lan: 290, opt1: 150 },
  { country: "Australia", wan: 301, lan: 340, opt1: 150 },
]

const chartConfig = {
  views: {
    label: "Page Views",
  },
  wan: {
    label: "WAN",
    color: "hsl(var(--chart-1))",
  },
  lan: {
    label: "LAN",
    color: "hsl(var(--chart-2))",
  },
  opt1: {
    label: "OPT1",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const Component = () => {
  const total = React.useMemo(
    () => ({
      wan: chartData.reduce((acc, curr) => acc + curr.wan, 0),
      lan: chartData.reduce((acc, curr) => acc + curr.lan, 0),
      opt1: chartData.reduce((acc, curr) => acc + curr.opt1, 0),
    }),
    []
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Multiple</CardTitle>
          {/* <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription> */}
        </div>
        {/* <div className="flex">
          {["wan", "lan", "opt1"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div> */}
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="country"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={0} // Ensure labels have enough space
              interval={0} // Ensure all labels are displayed
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                const label = chartConfig[name as keyof typeof chartConfig]?.label || name
                return [`${value}`, label]
              }}
              labelFormatter={(label) => `Country: ${label}`}
            />
            <Legend />
            {Object.keys(chartConfig).map((key) => (
              key !== "views" && (
                <Bar key={key} dataKey={key} fill={chartConfig[key].color} />
              )
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default Component