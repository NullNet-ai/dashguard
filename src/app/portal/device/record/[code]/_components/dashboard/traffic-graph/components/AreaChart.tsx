import { useMemo, useRef } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { formatBytes as formatBytesTooltip } from '../../pie-chart/function/formatBytes'

export const modifyAxis = (chartData:any) => {
  
  const maxBandwidth = Math.max(
    ...(chartData ?? [])?.map((item: any) => item?.bandwidth ?? 0)
  )

  const minBandwidth = Math.min(
    ...(chartData ?? [])?.map((item: any) => item?.bandwidth ?? Infinity)
  )

  const yAxisMax = Math.ceil(maxBandwidth * 1.25)
  const yAxisMin = Math.floor(minBandwidth * 0.9)

  
  return { yAxisMax, yAxisMin }
}

function formatBytes(bytes: any, decimals = 1) {
  if (bytes === 0) return '0 Bytes'

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals)) + ' ' + sizes[i]
}

export const formatNumber = (num: number) => {
  return formatBytes(+num)
}
const AreaChartComponent = ({ filteredData }: { filteredData: Record<string, any>[] }) => {
  const formatTooltipValue = (value: unknown) => {
    const numericValue = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(numericValue)
      ? formatBytesTooltip(numericValue)
      : String(value ?? '')
  }

  

  const previousYAxisMaxRef = useRef<number | null>(null)

  const { yAxisMax: calculatedYAxisMax, yAxisMin } = useMemo(
    () => modifyAxis(filteredData),
    [filteredData],
  )

  const yAxisMax = useMemo(() => {
    if (
      previousYAxisMaxRef.current === null ||
      calculatedYAxisMax > previousYAxisMaxRef.current
    ) {
      previousYAxisMaxRef.current = calculatedYAxisMax
    }
    return previousYAxisMaxRef.current
  }, [calculatedYAxisMax])
  
    const number_of_ticks = useMemo(() => {
      return yAxisMax >= 100000 ? 10 : 5
     },[yAxisMax])
  
     const yDomain = useMemo(() => {
      if (yAxisMax == null || yAxisMin == null) return ['auto', 'auto']
      if (yAxisMax === 0 && yAxisMin === 0) return [0, 1]
      return [yAxisMin, yAxisMax]
    }, [yAxisMin, yAxisMax])
  
  
     const yticks = useMemo(() => {
      if (yAxisMax == null || yAxisMin == null) return []
      if (yAxisMax === 0 && yAxisMin === 0) return [0]
      const ticks = [yAxisMin]
      for (let i = 1; i < number_of_ticks; i++) {
        ticks.push(
          Math.round(
            yAxisMin + i * ((yAxisMax - yAxisMin) / (number_of_ticks - 1)),
          ),
        )
      }
      return ticks
    }, [yAxisMin, yAxisMax, number_of_ticks])
  return (
    <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={filteredData}
    height={300} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
    >
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
        interval="preserveStartEnd"
        minTickGap={48}
        padding={{ left: 20, right: 20 }}
        allowDuplicatedCategory={false}
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
       <YAxis
          allowDataOverflow={true}
          axisLine={false}
          domain={yDomain}
          tickCount={number_of_ticks}
          tickFormatter={(value) => formatNumber(value)}
          tickLine={false}
          tickMargin={8}
          ticks={yticks}
          includeHidden={true}
          minTickGap={0}
          allowDecimals={false}
          scale="linear"
        />
      <ChartTooltip
        content={(
          <ChartTooltipContent
            indicator="dot"
            valueFormatter={formatTooltipValue}
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
        type="monotone"
        isAnimationActive={false}
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
    </ResponsiveContainer>
  )
}

export default AreaChartComponent
