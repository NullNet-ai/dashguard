'use client'

import * as React from 'react'

import { getLastTimeStamp, getUnit } from '~/app/portal/device/utils/timeRange'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
} from '~/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { api } from '~/trpc/react'

import { renderChart } from './function/renderChart'
import moment from 'moment-timezone'
import { IFormProps } from '../types'
import Filter from '../timeline/Filter'
import Search from '../timeline/Search'

const time_range_options = {
  '30d': '30 days',
  '7d': '1 Week',
  '1d': '1 Day',
  'live': 'Live',

}

const resolution_options = {
  '30d':
    {
      '1d': '1 Day',
      '7d': 'Last 7 days',
    },
  '7d':
    {
      '1d': '1 Day',
    },
  '1d':
    {
      '1h': '1 Hour',
      '30m': '30 Minutes',
    },
  'live':
    {
      '1s': '1 Second',
    },

} as any

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  bandwidth: {
    label: 'Bandwidth',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const TrafficGraph = ({defaultValues, params}: IFormProps) => {
  const [timeRange, setTimeRange] = React.useState('30d')
  const [resolution, setResolution] = React.useState<null | string>(null)
  const [graphType, setGraphType] = React.useState('default')

  const cardTitle = React.useMemo(() => {
    return graphType === 'bar' ? 'Bar Chart' : graphType === 'line' ? 'Line Chart' : 'Area Chart'
  }, [graphType])

  const timeRangeFormat = React.useMemo(() => {
    setResolution(null)
    if (
      timeRange === 'live'
    ) {
      return getLastTimeStamp(3, 'minute')
    }

    const amount = parseInt(timeRange.slice(0, -1), 10)
    const unit = timeRange.slice(-1)
    const unitFull = getUnit(unit)
    return getLastTimeStamp(amount, unitFull)
  }, [timeRange])

  const resolutionOpt = React.useMemo(() => {
    return [resolution_options?.[timeRange]] as any
  }, [timeRange])

  const { data: packetsIP = [], refetch } = api.packet.getBandwith.useQuery(
    {
      bucket_size: resolution === 'live' ? '1s' : resolution,
      time_range: timeRangeFormat,
      timezone,
      device_id: defaultValues?.id,
    })

  const filteredData = packetsIP?.map((item) => {
    const date = moment(item.bucket)
    if(timeRange === '1d') {
      return {
        ...item,
        bucket: date.format('HH:mm:ss')
      }
    }
    return {...item, bucket: date.format('MM/DD')}
  })

  React.useEffect(() => {
    refetch()

    const structMs = () => {
      if (!resolution) return
      const match = /^(\d+)([smhd])$/.exec(resolution)
      if (!match) return

      const value = parseInt(match[1], 10)
      const unit = match[2]

      // Convert to milliseconds
      const unitToMs = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      }

      const intervalMs = value * (unitToMs[unit] || 1000)
      return intervalMs
    }

    // Fetch immediately and start interval
    refetch()

    const intervalMs = structMs()

    const interval = setInterval(() => {
      if (!intervalMs) return
      refetch()
    }, intervalMs)
    return () => clearInterval(interval)
    // Cleanup on unmount or resolution change
  }
  , [resolution])

  return (
    <>
    <Filter params={{...params, router: 'packet', resolver: 'filterPackets' }}/>
    <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} />
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{`${cardTitle} - Interactive`}</CardTitle>
        </div>
        Time Range
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            aria-label="Select a value"
            className="w-[160px] rounded-lg sm:ml-auto"
          >
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {
              Object.entries(time_range_options).map(([key, label]) => (
                <SelectItem className = "rounded-lg" key = { key } value = { key }>
                  {label as string}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        Resolution
        <Select value={resolution || ''} onValueChange={setResolution}>
          <SelectTrigger
            aria-label="Select a value"
            className="w-[160px] rounded-lg sm:ml-auto"
          >
            <SelectValue placeholder="Select Resolution" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {resolutionOpt.map((options: any) => Object.entries(options).map(([key, label]) => (
              <SelectItem className = "rounded-lg" key = { key } value = { key }>
                {label as string}
              </SelectItem>
            ))
            )}
          </SelectContent>
        </Select>
        Graph Type
        <Select value={graphType} onValueChange={setGraphType}>
          <SelectTrigger
            aria-label="Select a value"
            className="w-[160px] rounded-lg sm:ml-auto"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem className="rounded-lg" value="default">
              Area Chart
            </SelectItem>
            <SelectItem className="rounded-lg" value="bar">
              Bar Chart
            </SelectItem>
            <SelectItem className="rounded-lg" value="line">
              Line Chart
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-2 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-full w-full p-5 overflow-x-auto"
          config={chartConfig}
        >

            {renderChart({ filteredData, graphType })}

        </ChartContainer>
      </CardContent>
    </Card>
    </>
  )
}

export default TrafficGraph
