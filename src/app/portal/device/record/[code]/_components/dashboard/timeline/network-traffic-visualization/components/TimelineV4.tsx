import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { FlagIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { Skeleton } from '~/components/ui/skeleton'
import { Star } from 'lucide-react'

const BW_SIZE = 18
const MS_THRESHOLD = 1e12

interface FlowData {
  source_ip?: string
  name?: string
  flag?: string
  active?: boolean
  isNew?: boolean
  lastBandwidth?: string
  total_active_packets?: number
  total_bandwidth?: number
}

interface CellData {
  bucketTime?: unknown
  time?: unknown
  bandwidth?: number
}

interface FlowPair {
  flow: FlowData
  row: CellData[]
}

interface Section {
  key: string
  label: string
  description: string
  rows: FlowPair[]
}

function truncateIP(ip: string, maxLength = 25): string {
  if (!ip || ip.length <= maxLength) return ip
  return ip.slice(0, maxLength - 3) + '...'
}

function getBandwidthColor(value: number, maxBandwidth: number): string {
  if (!value || value <= 0) return '#fff'
  if (!maxBandwidth || maxBandwidth <= 0) return '#65A1C7'

  const ratio = value / maxBandwidth
  if (ratio >= 1) return '#3F5F7E'
  if (ratio > 2 / 3) return '#B4D3ED'
  return '#65A1C7'
}

function toMs(value: unknown): number | null {
  if (value == null) return null

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < MS_THRESHOLD ? value * 1_000 : value
  }

  const str = String(value).trim()
  if (!str) return null

  if (str.length === 19 && str[10] === ' ') {
    const ts = new Date(str.replace(' ', 'T')).getTime()
    if (!Number.isNaN(ts)) return ts
  }

  const parsed = Date.parse(str)
  if (!Number.isNaN(parsed)) return parsed

  const n = Number(str)
  return Number.isFinite(n) ? (n < MS_THRESHOLD ? n * 1_000 : n) : null
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatBucketTime(raw: unknown): string {
  const ms = toMs(raw)
  if (ms == null || !Number.isFinite(ms)) return String(raw ?? '—')
  const d = new Date(ms)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

function formatBandwidth(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  if (bytes >= 1024)        return (bytes / 1024).toFixed(2) + ' KB'
  return bytes + ' bytes'
}

function getIntensityLabel(value: number, maxBandwidth: number): string {
  if (!value || value <= 0 || !maxBandwidth) return 'None'
  const ratio = value / maxBandwidth
  if (ratio >= 1)     return 'High'
  if (ratio > 2 / 3) return 'Medium'
  return 'Low'
}


interface Props {
  topTrafficData:           FlowData[]   | undefined
  topTrafficFormatted:      CellData[][] | undefined
  recentIPData:             FlowData[]   | undefined
  recentIPFormatted:        CellData[][] | undefined
  pollingIntervalTopTraffic?: number
  pollingIntervalRecentIP?:   number
}

export default function GridVirtualizerFixed({ topTrafficData, topTrafficFormatted, recentIPData, recentIPFormatted, pollingIntervalTopTraffic, pollingIntervalRecentIP }: Props) {
  const eventEmitter = useEventEmitter()
  const [inlineFilter, setInlineFilter] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resolution, setResolution] = useState<string>('')
  const [timeCount, setTimeCount] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    top_traffic: true,
    recent_ip:   true,
  })

  useEffect(() => {
    const onFilter = (f: string)  => setInlineFilter(f)
    const onSort = (k: string)  => setSortKey(k)
    const onLoading = (l: boolean) => setIsLoading(Boolean(l))
    const onTimeSettings = (payload: { resolution?: string; time_count?: number; time_unit?: string }) => {
      setResolution(payload?.resolution ?? '')
      setTimeCount(payload?.time_count ?? null)
    }
    

    eventEmitter.on('timeline_inline_filter', onFilter)
    eventEmitter.on('timeline_sort_key', onSort)
    eventEmitter.on('timeline_loading', onLoading)
    eventEmitter.on('timeline_time_settings',  onTimeSettings)
    eventEmitter.emit('timeline_request_time_settings')

    return () => {
      eventEmitter.off('timeline_inline_filter', onFilter)
      eventEmitter.off('timeline_sort_key', onSort)
      eventEmitter.off('timeline_loading', onLoading)
      eventEmitter.off('timeline_time_settings',  onTimeSettings)
    }
  }, [eventEmitter])

  const colCount = useMemo(
    () => topTrafficFormatted?.[0]?.length ?? recentIPFormatted?.[0]?.length ?? 0,
    [topTrafficFormatted, recentIPFormatted],
  )

  useEffect(() => {
    if (colCount <= 0) return

    let latestMs = -Infinity
    for (const row of [...(topTrafficFormatted ?? []), ...(recentIPFormatted ?? [])]) {
      const cell = row?.[colCount - 1]
      const ms = toMs(cell?.bucketTime ?? cell?.time ?? null)
      if (ms != null && Number.isFinite(ms) && ms > latestMs) latestMs = ms
    }

    eventEmitter.emit('timeline_col_count', {
      colCount,
      lastBucketTime: latestMs > -Infinity ? latestMs : null,
    })
  }, [topTrafficFormatted, recentIPFormatted, colCount, eventEmitter])

  const sections = useMemo((): Section[] => {
    const topPairs: FlowPair[] = (topTrafficData ?? []).map((flow, i) => ({
      flow,
      row: (topTrafficFormatted ?? [])[i] ?? [],
    }))

    const recentPairs: FlowPair[] = (recentIPData ?? []).map((flow, i) => ({
      flow,
      row: (recentIPFormatted ?? [])[i] ?? [],
    }))

    const q = inlineFilter.toLowerCase()
    const filteredTop = q
      ? topPairs.filter(p => p.flow.source_ip?.toLowerCase().includes(q))
      : topPairs
    const filteredRecent = q
      ? recentPairs.filter(p => p.flow.source_ip?.toLowerCase().includes(q))
      : recentPairs

    const topTraffic = [...filteredTop].sort((a, b) => {
      const packetDiff = (Number(b.flow.total_active_packets) || 0)
                       - (Number(a.flow.total_active_packets) || 0)
      if (packetDiff !== 0) return packetDiff
      return (Number(b.flow.total_bandwidth) || 0) - (Number(a.flow.total_bandwidth) || 0)
    })

    const recentIP = [...filteredRecent].sort((a, b) => {
      if (sortKey === 'country') return (a.flow.name ?? '').localeCompare(b.flow.name ?? '')
      if (sortKey === 'source_ip') return (a.flow.source_ip ?? '').localeCompare(b.flow.source_ip ?? '')
      return 0
    })

    return [
      {
        key: 'top_traffic',
        label: 'Top Traffic',
        description: 'IPs generating the highest traffic within the selected time range',
        rows: topTraffic.slice(0, 5)
      },
      {
        key: 'recent_ip',
        label: 'Recent IP',
        description: 'Most recently observed IPs regardless of traffic volume',
        rows: recentIP.slice(0, 10)
      },
    ]
  }, [topTrafficData, topTrafficFormatted, recentIPData, recentIPFormatted, inlineFilter, sortKey])

  const maxBandwidth = useMemo(() => {
    let max = 0
    for (const section of sections)
      for (const pair of section.rows)
        for (const cell of pair.row) {
          const bw = Number(cell?.bandwidth) || 0
          if (bw > max) max = bw
        }
    return max
  }, [sections])

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const hasAnyRows = sections.some(s => s.rows.length > 0)
  if (!hasAnyRows || colCount === 0) return null

  const renderSkeletonRow = (key: number) => (
    <div
      key={key}
      className="grid"
      style={{ gridTemplateColumns: `250px repeat(${Math.min(colCount, 20)}, minmax(0, 1fr))` }}
    >
      <div className="flex items-center gap-2 pl-2 py-1 border-b border-r border-slate-100">
        <Skeleton className="h-4 w-28" />
      </div>
      {Array.from({ length: Math.min(colCount, 20) }, (_, j) => (
        <div key={j} className="border-b border-dotted border-slate-100 flex items-center justify-center w-full">
          <Skeleton className="w-full" style={{ height: BW_SIZE }} />
        </div>
      ))}
    </div>
  )

  const renderRow = (pair: FlowPair, rowKey: string) => (
    <div
      key={rowKey}
      className="grid"
      style={{ gridTemplateColumns: `250px repeat(${colCount}, minmax(0, 1fr))` }}
    >
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 pl-2 py-1 text-xs border-b border-r border-slate-100 cursor-default">
            {pair.flow.flag && (
              pair.flow.flag === '/unknown-flag.svg' ? (
                <div className="flex h-[15px] min-w-[30px] items-center justify-center bg-[#efefef]">
                  <FlagIcon className="size-2.5" />
                </div>
              ) : (
                <img src={pair.flow.flag} alt="" className="h-[15px] min-w-[30px]" />
              )
            )}
            <span className={pair.flow.active || pair.flow.isNew ? 'text-red-600' : 'text-black'}>
              {truncateIP(pair.flow.source_ip ?? '')}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-sm space-y-0.5">
            <div><strong>Country:</strong> {pair.flow.name}</div>
            <div><strong>Source IP:</strong> {pair.flow.source_ip}</div>
            {pair.flow.active && pair.flow.lastBandwidth && (
              <div><strong>Bandwidth:</strong> {pair.flow.lastBandwidth}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {Array.from({ length: colCount }, (_, colIndex) => {
        const cell = pair.row[colIndex]
        const bw = Number(cell?.bandwidth) || 0
        return (
          <div
            key={colIndex}
            className="border-b border-dotted border-slate-100 flex items-center justify-center w-full"
          >
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="w-full">
                <div
                  className="w-full"
                  style={{
                    height: BW_SIZE,
                    backgroundColor: getBandwidthColor(bw, maxBandwidth),
                  }}
                />
              </TooltipTrigger>
              {cell && (
                <TooltipContent side="top" className="z-[9999]">
                  <div className="text-xs space-y-0.5">
                    <div><span className="font-medium text-slate-600">IP:</span> {pair.flow.source_ip}</div>
                    <div>
                      <span className="font-medium text-slate-600">Time:</span>{' '}
                      {timeCount === 60
                        ? formatBucketTime(cell.bucketTime ?? cell.time).split(' ')[1]
                        : formatBucketTime(cell.bucketTime ?? cell.time)
                      }
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Traffic:</span>{' '}
                      {formatBandwidth(bw)} {resolution ? `(${resolution})` : ''}
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Intensity:</span>{' '}
                      {getIntensityLabel(bw, maxBandwidth)}
                    </div>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )
      })}
    </div>
  )

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-280px)] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-2">
            {['Top Traffic', 'Recent IP'].map((_, i) => (
              <div key={i}>
                <div className="sticky top-0 z-10 px-2 py-1">
                  <Skeleton className="h-6 w-40" />
                </div>
                {Array.from({ length: 4 }, (_, j) => renderSkeletonRow(j))}
              </div>
            ))}
          </div>
        ) : (
          sections.map((section, i) => {
            const refreshMs = section.key === 'top_traffic'
              ? pollingIntervalTopTraffic
              : pollingIntervalRecentIP

            return <div key={section.key}>
              <button
                className={`
                  w-full flex items-start gap-1.5 px-2 py-1
                  text-xs font-semibold text-foreground
                  bg-slate-50 border border-slate-200
                  hover:bg-slate-100 sticky top-0 z-10
                  ${i === 1 ? '-mt-px' : ''}
                `}
                onClick={() => toggleSection(section.key)}
              >
                {expandedSections[section.key]
                  ? <ChevronDownIcon  className="size-4 shrink-0" />
                  : <ChevronRightIcon className="size-4 shrink-0" />}
                <span className="flex flex-col justify-start items-start">
                  <span className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {section.key === 'top_traffic' && <Star size={14} fill="currentColor" className="text-[#EDC17E]" />}
                      {section.label}
                    </div>
                    {refreshMs != null && (
                      <span className="font-normal">
                        (<span className='text-slate-600'>Refresh</span>: {refreshMs / 1000}s)
                      </span>
                    )}
                  </span>
                  <span className="font-light text-slate-600 text-xs">
                    {section.description}
                  </span>
                </span>
              </button>

              {expandedSections[section.key] &&
                section.rows.map((pair, j) =>
                  renderRow(pair, `${section.key}-${j}`)
                )}
            </div>
          })
        )}
      </div>
    </TooltipProvider>
  )
}