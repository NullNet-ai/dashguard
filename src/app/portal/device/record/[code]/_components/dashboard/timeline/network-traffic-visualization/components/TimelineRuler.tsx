'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'

const MAJOR_TICK_COUNT = 4

type Granularity = 'second' | 'minute' | 'hour'

interface TimeSettings {
  time_count?: number
  time_unit?: string
  resolution?: string
}

interface ColCountPayload {
  colCount: number
  lastBucketTime: number | null
}

interface Tick {
  isMajor:  boolean
  label:    string
  position: 'first' | 'middle' | 'last' | 'none'
}

/** Milliseconds per granularity step — used as the ruler tick interval. */
const GRANULARITY_MS: Record<Granularity, number> = {
  second: 1_000,
  minute: 60_000,
  hour:   3_600_000,
}

/** Milliseconds per time unit — used to convert timeSettings window to ms. */
const UNIT_MS: Record<string, number> = {
  second: 1_000,
  minute: 60_000,
  hour:   3_600_000,
}

/** Derives tick granularity from a resolution string like "5min", "1hour". */
function resolveGranularity(resolution?: string): Granularity {
  const r = String(resolution ?? '').toLowerCase().trim()
  if (/hour|hours|hr\b|h$/.test(r)) return 'hour'
  if (/minute|minutes|min\b|m$/.test(r)) return 'minute'
  return 'second'
}

/** Zero-pads a number to 2 digits. */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatLabel(ms: number, granularity: Granularity): string {
  const d = new Date(ms)
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  if (granularity === 'minute') return `${h}:${m}`
  return `${h}:${m}:${s}`
}

/**
 * Returns a Set of `count` indices evenly spread across [0, length-1].
 * Used to pick which ticks get visible labels.
 *
 * Example: length=144, count=4 → {0, 48, 96, 143}
 */
function evenlySpacedIndices(length: number, count: number): Set<number> {
  const n = Math.min(count, length)
  if (n <= 1) return new Set([0])
  const last = length - 1
  return new Set(
    Array.from({ length: n }, (_, k) => Math.round((k * last) / (n - 1)))
  )
}

/**
 * buildTimes — computes the full array of ms timestamps for every ruler tick.
 *
 * ── LIVE MODE (liveColCount is set) ─────────────────────────────────────────
 *   Anchor = nowMs floored to the nearest step boundary.
 *   nowMs is ONLY updated when timeline_col_count fires (i.e. when the cell
 *   grid updates). No interval — the ruler moves exactly when cells move.
 *
 *   lastBucketTime from the server is intentionally ignored — it reflects the
 *   window end boundary (e.g. 09:00:00), not the current time (e.g. 08:48:00).
 *
 * ── STATIC / FALLBACK MODE (liveColCount is null) ───────────────────────────
 *   Used on first load or after a filter/settings change resets state.
 *
 *   A) timeSettings present → span exactly the configured window
 *   B) granularity = 'second' → last 60 seconds (60 ticks)
 *   C) granularity = 'minute' → full current hour 00→59 (60 ticks)
 *   D) granularity = 'hour'   → last 12 hours (12 ticks)
 */
function buildTimes(
  granularity: Granularity,
  timeSettings: TimeSettings | null,
  nowMs: number,
  liveColCount: number | null,
): number[] {
  const step = GRANULARITY_MS[granularity]

  // ── LIVE MODE ──────────────────────────────────────────────────────────────
  if (liveColCount != null && liveColCount > 0) {
    const flooredNow = Math.floor(nowMs / step) * step
    const start = flooredNow - (liveColCount - 1) * step
    return Array.from({ length: liveColCount }, (_, i) => start + i * step)
  }

  // ── STATIC / FALLBACK MODE ─────────────────────────────────────────────────
  const end = Math.floor(nowMs / step) * step

  // A) Configured time window
  if (timeSettings?.time_count && timeSettings?.time_unit) {
    const windowMs = timeSettings.time_count * (UNIT_MS[timeSettings.time_unit] ?? 0)
    if (windowMs > 0) {
      const count = Math.round(windowMs / step)
      return Array.from({ length: count }, (_, i) => end - windowMs + i * step)
    }
  }

  // B) Default: last 60 seconds
  if (granularity === 'second') {
    return Array.from({ length: 60 }, (_, i) => end - 59_000 + i * 1_000)
  }

  // C) Default: full current hour using local time (handles DST correctly)
  if (granularity === 'minute') {
    const d     = new Date(end)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0).getTime()
    return Array.from({ length: 60 }, (_, i) => start + i * 60_000)
  }

  // D) Default: last 12 hours
  return Array.from({ length: 12 }, (_, i) => end - 11 * 3_600_000 + i * 3_600_000)
}

export default function TimelineRuler() {
  const eventEmitter = useEventEmitter()

  const [granularity,  setGranularity]  = useState<Granularity>('second')
  const [timeSettings, setTimeSettings] = useState<TimeSettings | null>(null)
  const [isLoading,    setIsLoading]    = useState(false)
  const [liveColCount, setLiveColCount] = useState<number | null>(null)

  /**
   * nowMs is ONLY updated when handleColCount fires.
   * No setInterval — the ruler moves exactly when and only when the cell
   * grid updates. This prevents the ruler from continuously ticking
   * independently of the data.
   */
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  const handleChartData = useCallback((data: Array<{ resolution?: string }>) => {
    setGranularity(resolveGranularity(data?.[0]?.resolution))
  }, [])

  const handleLoading = useCallback((loading: boolean) => {
    setIsLoading(Boolean(loading))
  }, [])

  const handleTimeSettings = useCallback((payload: TimeSettings) => {
    setGranularity(resolveGranularity(payload?.resolution))
    setTimeSettings(payload)
    setLiveColCount(null)
  }, [])

  const handleColCount = useCallback(({ colCount }: ColCountPayload) => {
    if (Number.isFinite(colCount) && colCount > 0) {
      setLiveColCount(colCount)
    }
    setNowMs(Date.now())
  }, [])

  useEffect(() => {
    eventEmitter.on('timeline_chart_data',    handleChartData)
    eventEmitter.on('timeline_loading',       handleLoading)
    eventEmitter.on('timeline_time_settings', handleTimeSettings)
    eventEmitter.on('timeline_col_count',     handleColCount)

    return () => {
      eventEmitter.off('timeline_chart_data',    handleChartData)
      eventEmitter.off('timeline_loading',       handleLoading)
      eventEmitter.off('timeline_time_settings', handleTimeSettings)
      eventEmitter.off('timeline_col_count',     handleColCount)
    }
  }, [eventEmitter, handleChartData, handleLoading, handleTimeSettings, handleColCount])

  const ticks = useMemo((): Tick[] => {
    const times = buildTimes(granularity, timeSettings, nowMs, liveColCount)
    if (times.length === 0) return []

    const majorIndices = isLoading
      ? new Set<number>()
      : evenlySpacedIndices(times.length, MAJOR_TICK_COUNT)

    const majorList = [...majorIndices].sort((a, b) => a - b)
    const firstMajor = majorList[0]
    const lastMajor = majorList[majorList.length - 1]

    return times.map((ms, i) => {
      const isMajor = majorIndices.has(i)
      const label   = isMajor ? formatLabel(ms, granularity) : ''
      const position = !isMajor          ? 'none'
                     : i === firstMajor  ? 'first'
                     : i === lastMajor   ? 'last'
                     : 'middle'
      return { isMajor, label, position }
    })
  }, [granularity, timeSettings, isLoading, liveColCount, nowMs])

  if (ticks.length === 0) {
    return <div className="h-6 w-full border-b border-slate-100" />
  }

  return (
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-1 h-px bg-slate-200" />

      <div
        className="grid items-end"
        style={{ gridTemplateColumns: `repeat(${ticks.length}, minmax(0, 1fr))` }}
      >
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
                className={cn(
                  'absolute -top-5 text-[11px] text-slate-500 translate-x-[20%]',
                  {
                    'translate-x-1/2': tick.position === 'first',
                    '-translate-x-1/2': tick.position === 'last',
                    'translate-x-[70%]': /^\d{2}:\d{2}$/.test(tick.label) && tick.position !== 'last',
                    '-translate-x-1': /^\d{2}:\d{2}$/.test(tick.label) && tick.position === 'last',
                  }
                )}
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