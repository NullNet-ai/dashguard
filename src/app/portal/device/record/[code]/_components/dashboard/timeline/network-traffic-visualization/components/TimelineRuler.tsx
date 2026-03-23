'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'
import { type Tick } from '../types'

const MAJOR_TICK_COUNT = 4
const LIVE_TICK_INTERVAL = 1_000

type Granularity = 'second' | 'minute' | 'hour'

interface TimeSettings {
  time_count?: number
  time_unit?: string
  resolution?: string
}

interface ColCountPayload {
  colCount: number
  lastBucketTime: unknown
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
 *   Activated when GridVirtualizerFixed emits `timeline_col_count`.
 *   nowMs is always the anchor. Intermediate ticks floor to step boundaries;
 *   the last tick uses raw nowMs so seconds tick live at any resolution.
 *
 *   Example — 12hr range, 5min resolution, 144 cols, now = 12:37:42
 *     step       = 300_000 ms
 *     flooredEnd = 12:35:00
 *     start      = 12:35:00 − (143 × 5min) = 00:40:00
 *     ticks      = [00:40:00, 00:45:00, …, 12:35:00, 12:37:42]  ← last = raw now
 *
 * ── STATIC / FALLBACK MODE (liveColCount is null) ───────────────────────────
 *   Used on first load or after a filter/settings change resets state.
 *
 *   A) timeSettings present → span exactly the configured window
 *        e.g. 12hr + 5min res → 144 ticks from (now−12hr) to now
 *   B) granularity = 'second' → last 60 seconds (60 ticks)
 *   C) granularity = 'minute' → full current hour 00→59 (60 ticks)
 *   D) granularity = 'hour'   → last 12 hours (12 ticks)
 *
 * ── MAJOR TICK LABELS ───────────────────────────────────────────────────────
 *   4 evenly-spaced ticks get labels. Gap ≈ totalWindow / 3.
 *   e.g. 12hr window → labels ~4hr apart; 1hr window → labels ~20min apart.
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
    const flooredEnd = Math.floor(nowMs / step) * step
    const start      = flooredEnd - (liveColCount - 1) * step
    const times      = Array.from({ length: liveColCount }, (_, i) => start + i * step)
    times[times.length - 1] = nowMs  // last tick = exact now, never floored
    return times
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
   * nowMs drives live label updates. Stored as state (not a ref) so useMemo
   * recomputes when it changes. Updates every second via setInterval.
   */
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  // Live clock — updates nowMs every second so the last tick label keeps ticking.
  // useMemo recomputes on every nowMs change; labels that floor to a boundary
  // (intermediate ticks) only visually change when that boundary turns over.
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), LIVE_TICK_INTERVAL)
    return () => window.clearInterval(id)
  }, [])

  // Stable event handlers — useCallback prevents recreation on every render
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
    if (Number.isFinite(colCount) && colCount > 0) setLiveColCount(colCount)
  }, [])

  // Single effect registers/cleans up all event listeners
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
    // Always use nowMs as windowEnd so the ruler stays pinned to current time.
    const times = buildTimes(granularity, timeSettings, nowMs, liveColCount)
    if (times.length === 0) return []

    // Hide all labels while loading to avoid stale time flicker
    const majorIndices = isLoading
      ? new Set<number>()
      : evenlySpacedIndices(times.length, MAJOR_TICK_COUNT)

    const majorList = [...majorIndices].sort((a, b) => a - b)
    const firstMajor = majorList[0]
    const lastMajor  = majorList[majorList.length - 1]

    return times.map((ms, i) => {
      const isMajor = majorIndices.has(i)
      const label   = isMajor ? formatLabel(ms, granularity) : ''
      const position = !isMajor       ? 'none'
                     : i === firstMajor ? 'first'
                     : i === lastMajor  ? 'last'
                     : 'middle'
      return { isMajor, label, position }
    })
  }, [granularity, timeSettings, isLoading, liveColCount, nowMs])

  useEffect(() => {
    eventEmitter.emit('timeline_ticks', ticks)
  }, [eventEmitter, ticks])

  if (ticks.length === 0) {
    return <div className="h-6 w-full border-b border-slate-100" />
  }

  return (
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-1 h-px bg-slate-200" />

      <div
        className="grid items-end"
        style={{ gridTemplateColumns: `0 repeat(${ticks.length}, minmax(0, 1fr))` }}
      >
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