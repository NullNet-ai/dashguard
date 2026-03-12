'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'
import { generateTimeSeriesData } from '../functions/generateTimeSeriesDataPerSeconds'

const MAJOR_TICK_COUNT = 4
const MS_THRESHOLD = 1e12 // 13-digit timestamps = milliseconds

type Granularity = 'second' | 'minute' | 'hour'

interface TimelineData {
  result?: Array<{ bucketTime?: unknown; time?: unknown }>
  resolution?: string
}

interface TimeSettings {
  time_count?: number
  time_unit?: string
  resolution?: string
}

interface Tick {
  isMajor: boolean
  label: string
}

function resolveGranularity(resolution?: string): Granularity {
  const r = String(resolution ?? '').toLowerCase().trim()
  if (/hour|hours|hr\b|h$/.test(r)) return 'hour'
  if (/minute|minutes|min\b|m$/.test(r)) return 'minute'
  return 'second'
}

/** Normalises any timestamp-like value to milliseconds, or returns null. */
function toMs(value: unknown): number | null {
  if (value == null) return null

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < MS_THRESHOLD ? value * 1000 : value
  }

  const str = String(value).trim()
  if (!str) return null

  // "YYYY-MM-DD HH:MM:SS"
  if (str.length === 19 && str[10] === ' ') {
    const [datePart, timePart] = str.split(' ')
    const [y, mo, d] = datePart!.split('-').map(Number)
    const [h, mi, s] = timePart!.split(':').map(Number)
    const ts = Date.UTC(y!, mo! - 1, d!, h!, mi!, s!)
    if (!Number.isNaN(ts)) return ts
  }

  const parsed = Date.parse(str)
  if (!Number.isNaN(parsed)) return parsed

  const n = Number(str)
  return Number.isFinite(n) ? (n < MS_THRESHOLD ? n * 1000 : n) : null
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatLabel(ms: number, granularity: Granularity): string {
  const d = new Date(ms)
  const h = pad(d.getUTCHours())
  const m = pad(d.getUTCMinutes())
  if (granularity === 'hour') return `${h}:00`
  if (granularity === 'minute') return `${h}:${m}`
  return `${h}:${m}:${pad(d.getUTCSeconds())}`
}

/** Converts time_count + time_unit into an absolute { start, end } range. */
function settingsToRange(count?: number, unit?: string): { start: number; end: number } | null {
  if (!count || !unit) return null

  const multipliers: Record<string, number> = {
    second: 1_000,
    minute: 60_000,
    hour: 3_600_000,
  }
  const ms = multipliers[unit]
  if (!ms) return null

  const end = Date.now()
  return { start: end - count * ms, end }
}

/** Generates a series of evenly spaced timestamps covering a range or a sensible default. */
function buildFallbackTimes(granularity: Granularity, range: { start: number; end: number } | null, nowMs: number): number[] {
  if (range) {
    const intervals: Record<Granularity, number> = { second: 1_000, minute: 60_000, hour: 3_600_000 }
    const step = intervals[granularity]
    const count = Math.ceil((range.end - range.start) / step)
    return Array.from({ length: count }, (_, i) => range.start + i * step)
  }

  // Default: show the current minute/hour window
  const base = new Date(nowMs)
  const y = base.getUTCFullYear()
  const mo = base.getUTCMonth()
  const d = base.getUTCDate()
  const h = base.getUTCHours()
  const mi = base.getUTCMinutes()

  if (granularity === 'second') {
    const start = Date.UTC(y, mo, d, h, mi, 0)
    return Array.from({ length: 60 }, (_, i) => start + i * 1_000)
  }
  if (granularity === 'minute') {
    const start = Date.UTC(y, mo, d, h, 0, 0)
    return Array.from({ length: 60 }, (_, i) => start + i * 60_000)
  }
  // hour
  const start = Date.UTC(y, mo, d, h, 0, 0) - 11 * 3_600_000
  return Array.from({ length: 12 }, (_, i) => start + i * 3_600_000)
}

/** Picks up to `count` evenly distributed indices from an array. */
function evenlySpacedIndices(length: number, count: number): Set<number> {
  const n = Math.min(count, length)
  if (n <= 1) return new Set([0])
  const last = length - 1
  return new Set(Array.from({ length: n }, (_, k) => Math.round((k * last) / (n - 1))))
}

export default function TimelineRuler() {
  const eventEmitter = useEventEmitter()

  const [series, setSeries] = useState<TimelineData['result']>([])
  const [granularity, setGranularity] = useState<Granularity>('second')
  const [timeRange, setTimeRange] = useState<{ start: number; end: number } | null>(null)
  const [timeSettings, setTimeSettings] = useState<TimeSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const nowMsRef = useRef(Date.now())
  const [, forceUpdate] = useState({})

  // Subscribe to chart / loading / settings events
  useEffect(() => {
    const handleChartData = (data: TimelineData[]) => {
      const first = data?.[0]
      setSeries(first?.result ?? [])
      setGranularity(resolveGranularity(first?.resolution))
    }

    const handleLoading = (loading: boolean) => {
      setIsLoading(Boolean(loading))
      if (loading) setSeries([])
    }

    const handleTimeSettings = (payload: TimeSettings) => {
      setGranularity(resolveGranularity(payload?.resolution))
      setTimeRange(settingsToRange(payload.time_count, payload.time_unit))
      setTimeSettings(payload)
    }

    eventEmitter.on('timeline_chart_data', handleChartData)
    eventEmitter.on('timeline_loading', handleLoading)
    eventEmitter.on('timeline_time_settings', handleTimeSettings)

    return () => {
      eventEmitter.off('timeline_chart_data', handleChartData)
      eventEmitter.off('timeline_loading', handleLoading)
      eventEmitter.off('timeline_time_settings', handleTimeSettings)
    }
  }, [eventEmitter])

  // Keep nowMsRef current; re-render only when the ruler is actively showing data
  useEffect(() => {
    const id = window.setInterval(() => {
      nowMsRef.current = Date.now()
      if (series && series.length > 0) forceUpdate({})
    }, 1_000)
    return () => window.clearInterval(id)
  }, [series?.length])

  const ticks = useMemo((): Tick[] => {
    // 1. Resolve timestamps from series data (or fall back to generated defaults)
    let times: number[] = []

    if (series && series.length > 0) {
      const { resolution, time_count, time_unit } = timeSettings ?? {}

      if (resolution && time_count && time_unit) {
        try {
          const formatted = generateTimeSeriesData(series, resolution, time_count, time_unit)
          times = formatted.flatMap((item) => {
            const ms = toMs((item as any)?.bucketTime ?? (item as any)?.time)
            return ms != null ? [ms] : []
          })
        } catch {
          // fall through to simpler extraction below
        }
      }

      if (times.length === 0) {
        times = series.flatMap((v) => {
          const ms = toMs(v?.bucketTime ?? v?.time)
          return ms != null ? [ms] : []
        })
      }
    }

    if (times.length === 0) {
      times = buildFallbackTimes(granularity, timeRange, nowMsRef.current)
    }

    if (times.length === 0) return []

    // 2. Mark major ticks at evenly spaced positions
    const majorIndices = isLoading ? new Set<number>() : evenlySpacedIndices(times.length, MAJOR_TICK_COUNT)

    return times.map((ms, i) => {
      const isMajor = majorIndices.has(i)
      return { isMajor, label: isMajor ? formatLabel(ms, granularity) : '' }
    })
  }, [series, granularity, timeRange, timeSettings, isLoading])

  if (ticks.length === 0) {
    return <div className="h-6 w-full border-b border-slate-100" />
  }

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-1 h-px bg-slate-200" />

      <div
        className="grid items-end"
        style={{ gridTemplateColumns: `0 repeat(${ticks.length}, minmax(0, 1fr))` }}
      >
        {/* Spacer for grid alignment */}
        <div aria-hidden />

        {ticks.map((tick, i) => (
          <div
            key={i}
            className={cn(
              'relative flex items-end justify-center border-r',
              tick.isMajor ? 'h-4 border-slate-400' : 'h-3 border-slate-200',
            )}
          >
            {tick.label && (
              <span
                className={cn('absolute -top-5 text-[11px] translate-x-[20%] text-slate-500', {
                  'translate-x-1/2': i === 0,
                  'translate-x-[50%]': /^\d{2}:\d{2}$/.test(tick.label) || i === (ticks.length - 1),
                  '-translate-x-1': /^\d{2}:\d{2}$/.test(tick.label) && i === (ticks.length - 1),
                  '-translate-x-1/2': i === (ticks.length - 1),
                })}
              >
                {tick.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}