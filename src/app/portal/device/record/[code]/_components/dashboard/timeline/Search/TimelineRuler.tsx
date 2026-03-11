'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'

/**
 * Terms guide:
 * - granularity: The active time unit for ticks ('second' | 'minute' | 'hour'),
 *   derived from the timeline resolution.
 * - TICK_CONFIG.<unit>.spacing: Number of <unit> between major ticks
 *   (e.g., seconds: 10 -> major every 10s).
 * - TICK_CONFIG.<unit>.phase: Fixed offset for majors when anchorToFirst=false
 *   (e.g., seconds phase=5 -> majors at :05, :15, :25, ...).
 * - TICK_CONFIG.anchorToFirst: When true, majors align to the first bucket in
 *   the current series (ignores phase). When false, majors use the fixed phase.
 */

const TICK_CONFIG = {
  second: { spacing: 10, phase: 0 },
  minute: { spacing: 15, phase: 0 },
  hour: { spacing: 60, phase: 0 },
  anchorToFirst: false,
} as const

// threshold to distinguish between seconds and milliseconds (13-digit timestamps are milliseconds)
const MILLISECONDS_THRESHOLD = 1e12

interface TimelineData {
  result?: Array<{ bucketTime?: any; time?: any }>
  resolution?: string
}

function resolveGranularity(resolution?: string): 'second' | 'minute' | 'hour' {
  const r = String(resolution || '').toLowerCase().trim()
  if (/(^|\W)(hour|hours|hr|h)(\W|$)/.test(r) || r.endsWith('h')) return 'hour'
  if (/(^|\W)(minute|minutes|min|m)(\W|$)/.test(r) || r.endsWith('m')) return 'minute'
  if (/(^|\W)(second|seconds|sec|s)(\W|$)/.test(r) || r.endsWith('s')) return 'second'
  return 'second'
}

function parseTimeMs(value: unknown): number | null {
  if (value == null) return null
  
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < MILLISECONDS_THRESHOLD ? value * 1000 : value
  }
  
  const str = String(value).trim()
  if (!str) return null
  
  if (str.length === 19 && str[10] === ' ') {
    const y = parseInt(str.slice(0, 4), 10)
    const mo = parseInt(str.slice(5, 7), 10) - 1
    const d = parseInt(str.slice(8, 10), 10)
    const h = parseInt(str.slice(11, 13), 10)
    const mi = parseInt(str.slice(14, 16), 10)
    const s = parseInt(str.slice(17, 19), 10)
    
    if (!Number.isNaN(y + mo + d + h + mi + s)) {
      return Date.UTC(y, mo, d, h, mi, s)
    }
  }
  
  if (/^\d{1,2}$/.test(str)) {
    const now = Date.now()
    const date = new Date(now)
    const s = parseInt(str, 10)
    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      s
    )
  }
  
  const timestamp = Date.parse(str)
  if (!Number.isNaN(timestamp)) return timestamp
  
  const n = Number(str)
  return Number.isFinite(n) ? (n < MILLISECONDS_THRESHOLD ? n * 1000 : n) : null
}


const padding = (n: number) => String(n).padStart(2, '0')

function formatLabel(ms: number, granularity: 'second' | 'minute' | 'hour'): string {
  const date = new Date(ms)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  
  if (granularity === 'hour') return `${padding(hours)}:00`
  if (granularity === 'minute') return `${padding(hours)}:${padding(minutes)}`
  
  const seconds = date.getUTCSeconds()
  return `${padding(hours)}:${padding(minutes)}:${padding(seconds)}`
}

export default function TimelineRuler() {
  const eventEmitter = useEventEmitter()
  const [series, setSeries] = useState<any[]>([])
  const [granularity, setGranularity] = useState<'second' | 'minute' | 'hour'>('second')
  const nowMsRef = useRef<number>(Date.now())
  
  // use ref to avoid unnecessary state updates for time
  const [, forceUpdate] = useState({})

  function generateFallbackTimes(g: 'second' | 'minute' | 'hour', nowMs: number): number[] {
    const base = new Date(nowMs)
    const y = base.getUTCFullYear()
    const mo = base.getUTCMonth()
    const d = base.getUTCDate()
    const h = base.getUTCHours()
    const mi = base.getUTCMinutes()
    const times: number[] = []
    if (g === 'second') {
      const start = Date.UTC(y, mo, d, h, mi, 0)
      for (let i = 0; i < 60; i++) times.push(start + i * 1000)
      return times
    }
    if (g === 'minute') {
      const start = Date.UTC(y, mo, d, h, 0, 0)
      for (let i = 0; i < 60; i++) times.push(start + i * 60 * 1000)
      return times
    }
    const count = 12
    const start = Date.UTC(y, mo, d, h, 0, 0) - (count - 1) * 60 * 60 * 1000
    for (let i = 0; i < count; i++) times.push(start + i * 60 * 60 * 1000)
    return times
  }

  useEffect(() => {
    const onChartData = (data: TimelineData[]) => {
      const first = Array.isArray(data) && data.length > 0 ? data[0] : null
      const row = first?.result || []
      setSeries(row)
      
      setGranularity(resolveGranularity(first?.resolution))
    }
    
    const onLoading = (loading: boolean) => {
      if (loading) setSeries([])
    }
    
    const onTimeSettings = (payload: { resolution?: string }) => {
      setGranularity(resolveGranularity(payload?.resolution))
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
    const id = window.setInterval(() => {
      nowMsRef.current = Date.now()
      // only force update if we have data to display
      if (series.length > 0) {
        forceUpdate({})
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [series.length])

  const ticks = useMemo(() => {
    // parse and filter valid timestamps
    const times: number[] = []
    for (const v of series) {
      const ms = parseTimeMs(v?.bucketTime ?? v?.time)
      if (ms != null) {
        times.push(ms)
      }
    }

    // generate default times if no data available
    if (times.length === 0) {
      times.push(...generateFallbackTimes(granularity, nowMsRef.current))
    }

    if (times.length === 0) return []
 
     const firstD = new Date(times[0]!)
     const secOffset = TICK_CONFIG.anchorToFirst
       ? firstD.getUTCSeconds() % TICK_CONFIG.second.spacing
       : (TICK_CONFIG.second.phase % TICK_CONFIG.second.spacing + TICK_CONFIG.second.spacing) % TICK_CONFIG.second.spacing
     const minOffset = TICK_CONFIG.anchorToFirst
       ? firstD.getUTCMinutes() % TICK_CONFIG.minute.spacing
       : (TICK_CONFIG.minute.phase % TICK_CONFIG.minute.spacing + TICK_CONFIG.minute.spacing) % TICK_CONFIG.minute.spacing
     const hourOffset = TICK_CONFIG.anchorToFirst
       ? firstD.getUTCMinutes() % TICK_CONFIG.hour.spacing
       : (TICK_CONFIG.hour.phase % TICK_CONFIG.hour.spacing + TICK_CONFIG.hour.spacing) % TICK_CONFIG.hour.spacing

     const result = []
     for (let i = 0; i < times.length; i++) {
       const ms = times[i]!
       const date = new Date(ms)
       const minute = date.getUTCMinutes()
       const second = date.getUTCSeconds()
      
      let isMajor = false
      if (granularity === 'hour') {
        isMajor = ((minute - hourOffset + 60) % TICK_CONFIG.hour.spacing) === 0
      } else if (granularity === 'minute') {
        isMajor = ((minute - minOffset + 60) % TICK_CONFIG.minute.spacing) === 0
      } else {
        isMajor = ((second - secOffset + 60) % TICK_CONFIG.second.spacing) === 0
      }
      
      result.push({
        isMajor,
        label: isMajor ? formatLabel(ms, granularity) : '',
      })
    }
    
    if (!result.some((r) => r.isMajor) && result.length > 0) {
      result[0] = { isMajor: true, label: formatLabel(times[0]!, granularity) }
    }
    
    return result
  }, [series, granularity])

  const columns = Math.max(ticks.length, 0)

  if (columns === 0) return <div className="h-6 w-full border-b border-slate-100" />

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-1 h-px bg-slate-200" />
      <div
        className="grid items-end"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {ticks.map((t, i) => (
          <div key={i} className={`relative flex items-end justify-center border-r  ${t.isMajor ? 'h-3 border-slate-400' : 'h-2 border-slate-200'}`}>
            {t.label && (
              <span className={cn("absolute -top-5 text-[11px] text-slate-500", {
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
