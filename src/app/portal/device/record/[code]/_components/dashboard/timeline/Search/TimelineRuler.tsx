'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'

/**
 * Terms guide:
 * - granularity: The active time unit for ticks ('second' | 'minute' | 'hour'),
 *   derived from the timeline resolution.
 * - TICK_CONFIG.idealMajorCount: Target number of labeled ticks visible at any zoom level.
 * - TICK_CONFIG.minSpacing: Minimum ticks between majors (prevents bunching on small datasets).
 * - TICK_CONFIG.maxSpacing: Maximum ticks between majors (prevents disappearing on huge datasets).
 */
const TICK_CONFIG = {
  idealMajorCount: 6,
  minSpacing: 1,
  maxSpacing: 99999,
} as const

type Granularity = 'second' | 'minute' | 'hour'

// Extracted: was duplicated in onChartData and onTimeSettings
function parseGranularity(resolution: string): Granularity {
  const res = resolution.toLowerCase()
  if (res.startsWith('s') || res.endsWith('s')) return 'second'
  if (res.startsWith('m') || res.endsWith('m')) return 'minute'
  if (res.startsWith('h') || res.endsWith('h')) return 'hour'
  return 'second'
}

function parseTimeMs(value: any): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value < 1e12 ? value * 1000 : value
  const str = String(value).trim()
  if (!str) return null
  const full = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/)
  if (full) {
    const [, y, mo, d, h, mi, s] = full.map(Number)
    return Date.UTC(y!, mo! - 1, d, h, mi, s)
  }
  if (/^\d{1,2}$/.test(str)) {
    const now = new Date()
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), parseInt(str, 10))
  }
  const d = new Date(str)
  if (!Number.isNaN(d.getTime())) return d.getTime()
  const n = Number(str)
  if (Number.isFinite(n)) return n < 1e12 ? n * 1000 : n
  return null
}

function formatLabel(ms: number, granularity: Granularity): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  const hh = pad(d.getUTCHours())
  const mm = pad(d.getUTCMinutes())
  const ss = pad(d.getUTCSeconds())
  if (granularity === 'hour') return `${hh}:00`
  if (granularity === 'minute') return `${hh}:${mm}`
  return `${hh}:${mm}:${ss}`
}

function buildFallbackTimes(nowMs: number): number[] {
  const base = new Date(nowMs)
  return Array.from({ length: 60 }, (_, i) =>
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), base.getUTCHours(), base.getUTCMinutes(), i),
  )
}

export default function TimelineRuler() {
  const eventEmitter = useEventEmitter()
  const [series, setSeries] = useState<any[]>([])
  const [granularity, setGranularity] = useState<Granularity>('second')
  const [nowMs, setNowMs] = useState<number>(Date.now())

  useEffect(() => {
    const onChartData = (data: any[]) => {
      const first = Array.isArray(data) && data.length > 0 ? data[0] : null
      setSeries(first?.result || [])
      setGranularity(parseGranularity(String(first?.resolution || '')))
    }
    const onLoading = (loading: boolean) => {
      if (loading) setSeries([])
    }
    const onTimeSettings = (payload: any) => {
      setGranularity(parseGranularity(String(payload?.resolution || '')))
    }

    eventEmitter.on('timeline_chart_data', onChartData)
    eventEmitter.on('timeline_loading', onLoading)
    eventEmitter.on('timeline_time_settings', onTimeSettings)
    return () => {
      eventEmitter.off('timeline_chart_data', onChartData)
      eventEmitter.off('timeline_loading', onLoading)
      eventEmitter.off('timeline_time_settings', onTimeSettings)
    }
  }, [eventEmitter])

  useEffect(() => {
    if (series.length > 0) return
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [series.length])

  const ticks = useMemo(() => {
    // No real data yet — show 60 fake minor ticks with no labels as a placeholder
    if (series.length === 0) {
      return buildFallbackTimes(nowMs).map(() => ({ isMajor: false, label: '' }))
    }

    // Use real data timestamps
    const times = series
      .map((v) => parseTimeMs(v?.bucketTime ?? v?.time))
      .filter((ms): ms is number => ms != null)

    if (times.length === 0) return []

    // How far apart should labeled ticks be?
    // e.g. 144 ticks ÷ 6 = label every 24th tick
    const spacing = Math.min(
      TICK_CONFIG.maxSpacing,
      Math.max(TICK_CONFIG.minSpacing, Math.round(times.length / TICK_CONFIG.idealMajorCount))
    )

    // Mark every Nth tick as major (labeled), the rest as minor
    return times.map((ms, i) => {
      const isMajor = i % spacing === 0
      return {
        isMajor,
        label: isMajor ? formatLabel(ms, granularity) : '',
      }
    })
  }, [series, granularity, nowMs])

  if (ticks.length === 0) return <div className="h-6 w-full border-b border-slate-100" />

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-1 h-px bg-slate-200" />
      <div
        className="grid items-end"
        style={{ gridTemplateColumns: `repeat(${ticks.length}, minmax(0, 1fr))` }}
      >
        {ticks.map((t, i) => (
          <div
            key={i}
            className={`relative flex items-end justify-center border-r ${t.isMajor ? 'h-3 border-slate-400' : 'h-2 border-slate-200'}`}
          >
            {t.label && (
              <span className={cn('absolute -top-5 text-[11px] text-slate-500', {
                'translate-x-1/2': t.isMajor && granularity === 'second' && i === 0,
              })}>
                {t.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}