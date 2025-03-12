import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

const AreaChartComponent = ({ filteredData }: { filteredData: Record<string, any>[] }) => {
  return (
    <AreaChart data={filteredData} height={300} width={1870}>
      <defs>
        <linearGradient id="fillBandwidth" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--color-bandwidth)"
            stopOpacity={0.8}
          />
          <stop
            offset="95%"
            stopColor="var(--color-bandwidth)"
            stopOpacity={0.1}
          />
        </linearGradient>
        {/* <linearGradient id="fillStaticBandwidth" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--color-static_bandwidth)"
            stopOpacity={0.8}
          />
          <stop
            offset="95%"
            stopColor="var(--color-static_bandwidth)"
            stopOpacity={0.1}
          />
        </linearGradient> */}
      </defs>
      <CartesianGrid vertical={false} />
      <XAxis
        axisLine={false}
        dataKey="bucket"
        minTickGap={32}
        tickFormatter={(value) => {
          const date = new Date(value)
          if (value.includes(':')) {
            return value; // Display time directly if it includes ':'
          }
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        }}
        tickLine={false}
        tickMargin={8}
      />
      <ChartTooltip
        content={(
          <ChartTooltipContent
            indicator="dot"
            labelFormatter={(value) => {
              if (value.includes(':')) {
                return value; // Display time directly if it includes ':'
              }
              return new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }}
          />
        )}
        cursor={false}
      />
      <Area
        dataKey="bandwidth"
        fill="url(#fillBandwidth)"
        stackId="a"
        stroke="var(--color-bandwidth)"
        type="natural"
      />
      {/* <Area
        dataKey="static_bandwidth"
        fill="url(#fillStaticBandwidth)"
        stackId="a"
        stroke="var(--color-static_bandwidth)"
        type="natural"
      /> */}
      <ChartLegend content={<ChartLegendContent />} />
    </AreaChart>
  )
}

export default AreaChartComponent
