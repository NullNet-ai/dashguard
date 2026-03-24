'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'
import { type Tick } from '../types'

const MAJOR_TICK_COUNT = 4
const COL_COUNT = 60

interface TimeSettings {
  time_count?: number
  time_unit?: string
  resolution?: string
}

interface ColCountPayload {
  colCount: number
  lastBucketTime: number | null
}

/**
 * Parses resolution string into milliseconds.
 * Resolution is fixed by time range:
 *   30m → 30s → 30_000ms
 *   1h  → 1m  → 60_000ms
 *   3h  → 3m  → 180_000ms
 *   6h  → 6m  → 360_000ms
 *   12h → 12m → 720_000ms
 *   24h → 24m → 1_440_000ms
 *
 * All produce 60 cols: timeRange / resolution = 60
 */
function resolveStepMs(resolution?: string): number {
  const r = String(resolution ?? '').toLowerCase().trim()
  // e.g. "30s", "1m", "3m", "6m", "12m", "24m"
  const secMatch = r.match(/^(\d+)s$/)
  if (secMatch && secMatch[1]) return parseInt(secMatch[1], 10) * 1_000
  const minMatch = r.match(/^(\d+)m(in)?$/)
  if (minMatch && minMatch[1]) return parseInt(minMatch[1], 10) * 60_000
  const hrMatch = r.match(/^(\d+)h(r)?$/)
  if (hrMatch && hrMatch[1]) return parseInt(hrMatch[1], 10) * 3_600_000
  // default: 1 minute
  return 60_000
}

/**
 * Whether to show HH:MM:SS or HH:MM on labels.
 * Show seconds only when step < 60s (i.e. second-level resolution).
 */
function formatLabel(ms: number, stepMs: number): string {
  const d = new Date(ms)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return stepMs < 60_000 ? `${h}:${m}:${s}` : `${h}:${m}`
}

function evenlySpacedIndices(length: number, count: number): Set<number> {
  const n = Math.min(count, length)
  if (n <= 1) return new Set([0])
  const last = length - 1
  return new Set(Array.from({ length: n }, (_, k) => Math.round((k * last) / (n - 1))))
}

function buildTimes(stepMs: number, endMs: number, count: number): number[] {
  const flooredEnd = Math.floor(endMs / stepMs) * stepMs
  const start = flooredEnd - (count - 1) * stepMs
  return Array.from({ length: count }, (_, i) => start + i * stepMs)
}

export default function TimelineRuler() {
  const eventEmitter = useEventEmitter()
  const [stepMs, setStepMs] = useState<number>(60_000)
  const [isLoading, setIsLoading] = useState(false)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const [count, setCount] = useState<number>(COL_COUNT)

  const handleLoading = useCallback((loading: boolean) => {
    setIsLoading(Boolean(loading))
  }, [])

  const handleTimeSettings = useCallback((payload: TimeSettings) => {
    setStepMs(resolveStepMs(payload?.resolution))
  }, [])

  const handleColCount = useCallback((payload: ColCountPayload) => {
    if (payload?.colCount && Number.isFinite(payload.colCount)) {
      setCount(payload.colCount)
    }
    if (payload?.lastBucketTime != null && Number.isFinite(payload.lastBucketTime)) {
      setNowMs(payload.lastBucketTime)
    } else {
      setNowMs(Date.now())
    }
  }, [])

  useEffect(() => {
    eventEmitter.on('timeline_loading', handleLoading)
    eventEmitter.on('timeline_time_settings', handleTimeSettings)
    eventEmitter.on('timeline_col_count', handleColCount)
    return () => {
      eventEmitter.off('timeline_loading', handleLoading)
      eventEmitter.off('timeline_time_settings', handleTimeSettings)
      eventEmitter.off('timeline_col_count', handleColCount)
    }
  }, [eventEmitter, handleLoading, handleTimeSettings, handleColCount])

  const ticks = useMemo((): Tick[] => {
    const times = buildTimes(stepMs, nowMs, count)
    const majorIndices = isLoading
      ? new Set<number>()
      : evenlySpacedIndices(times.length, MAJOR_TICK_COUNT)
    const majorList = [...majorIndices].sort((a, b) => a - b)
    const firstMajor = majorList[0]
    const lastMajor = majorList[majorList.length - 1]
    return times.map((ms, i) => {
      const isMajor = majorIndices.has(i)
      const label = isMajor ? formatLabel(ms, stepMs) : ''
      const position = !isMajor ? 'none'
        : i === firstMajor ? 'first'
        : i === lastMajor ? 'last'
        : 'middle'
      return { isMajor, label, position }
    })
  }, [stepMs, isLoading, nowMs, count])

  useEffect(() => {
    eventEmitter.emit('timeline_ticks', ticks)
  }, [eventEmitter, ticks])

  if (ticks.length === 0) {
    return <div className="h-6 w-full border-b border-slate-100" />
  } 

  return (
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-1 h-px bg-slate-200 mx-[1px]" />
      <div
        className="grid items-end border-x border-slate-400"
        style={{ gridTemplateColumns: `repeat(${ticks.length}, minmax(0, 1fr))` }}
      >
        {ticks.map((tick, i) => (
          <div
            key={i}
            className={cn(
              'relative flex items-end justify-center border-l',
              tick.isMajor ? 'h-4 border-slate-400' : 'h-3 border-slate-200', {
                'h-3 border-slate-200 border-l-0' : tick.position === 'first',
                'h-3 border-slate-200' : tick.position === 'last',
              }
            )}
          >
            {tick.label && (
              <span
                className={cn(
                  'absolute -top-5 text-[11px] text-slate-500',
                  {
                    'translate-x-1/4':  (tick.position === 'first'  && tick.label.length > 5) || (tick.position === 'last'   && tick.label.length <= 5),
                    '-translate-x-1/4': tick.position === 'last'   && tick.label.length > 5,
                    '-translate-x-1.5': (tick.position === 'middle' && tick.label.length > 5) || (tick.position === 'first'  && tick.label.length <= 5),
                    '-translate-x-4':   tick.position === 'middle' && tick.label.length <= 5,
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