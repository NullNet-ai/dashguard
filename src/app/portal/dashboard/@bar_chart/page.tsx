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

const CustomTooltip = ({ active, payload, label, hoveredBar }) => {
  if (!active || !payload || !payload.length || !hoveredBar) return null;

  // Find the specific data point that matches our hovered bar
  const dataPoint = payload.find(p => p.dataKey === hoveredBar.key);
  if (!dataPoint) return null;

  return (
    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
      <p className="font-medium">{`Country: ${label}`}</p>
      <p className="text-sm">
        {`${chartConfig[hoveredBar.key].label}: ${dataPoint.value}`}
      </p>
    </div>
  );
};

const Component = () => {
  const [hoveredBar, setHoveredBar] = React.useState(null);

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
        </div>
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
              minTickGap={0}
              interval={0}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<CustomTooltip hoveredBar={hoveredBar} />}
              isAnimationActive={false}
            />
            <Legend />
            {Object.keys(chartConfig).map((key) => (
              key !== "views" && (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key].color}
                  onMouseEnter={(data, index) => {
                    setHoveredBar({ key, index });
                  }}
                  onMouseLeave={() => {
                    setHoveredBar(null);
                  }}
                  style={{ cursor: 'pointer' }}
                  shape={(props) => {
                    const isHovered = hoveredBar?.key === key && hoveredBar?.index === props.index;
                    return (
                      <path
                        d={`M ${props.x},${props.y} h ${props.width} v ${props.height} h -${props.width} Z`}
                        fill={props.fill}
                        fillOpacity={isHovered ? 0.8 : 0.8}
                        stroke={isHovered ? "#000" : "none"}
                        strokeWidth={isHovered ? 1 : 0}
                      />
                    );
                  }}
                />
              )
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default Component