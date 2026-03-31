'use client'
import React, {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { type IBandwidth, type INetworkFlowContext } from './types'
import { useSocketConnection } from '../../custom-hooks/useSocketConnection';
import { updateBandwidth } from './functions/updateBandwidth';

interface ITimeSettings {
  time_count: number
  time_unit: 'second' | 'minute' | 'hour'
  resolution: string
}

const ONE_SECOND_MS     = 1_000
const THREE_SECONDS_MS  = 3_000
const FIVE_SECONDS_MS   = 5_000
const TEN_SECONDS_MS    = 10_000
const THIRTY_SECONDS_MS = 30_000
const ONE_MINUTE_MS     = 60_000

const withTotal = (items: IBandwidth[]): IBandwidth[] =>
  items.map(item => ({
    ...item,
    total_bandwidths: item.result?.reduce((acc, curr) => acc + Number(curr.bandwidth), 0) ?? 0,
    total_active_packets: item.result?.reduce((acc, curr) => {
      if (Number(curr.bandwidth) > 0) {
        return acc + 1
      }
      return acc
    }, 0) ?? 0,
  }))

const NetworkFlowContext = React.createContext<INetworkFlowContext>({
})
const channel_name = 'timeline_connections'

interface IProps extends PropsWithChildren {
  params?: {
    id: string
    shell_type: 'record' | 'wizard'
    entity: string
  }
}

export default function NetworkFlowProvider({ children, params }: IProps) {
  const eventEmitter = useEventEmitter()
  const [filterId, setFilterID] = useState('01JNQ9WPA2JWNTC27YCTCYC1FE')
  const [searchBy, setSearchBy] = useState()
  const [time, setTime] = useState<ITimeSettings | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [token, setToken] = React.useState<string | null>(null)
  const [org_acc_id, setOrgAccountID] = React.useState<string | null>(null)
  /**
   * Renderable snapshot committed to React state. Updating this triggers
   * re-renders for consumers.  All *mutations* happen on the `*Ref` mirrors
   * below; only the final result is written here via `startTransition` to
   * avoid blocking the UI thread.
   */
  const [snapshot, setSnapshot] = useState({
    recentIPData:           [] as IBandwidth[],  // IPs seen in the last poll window
    topTrafficData:         [] as IBandwidth[],  // top-5 IPs by active-packet count
    unique_source_ips:      [] as string[],
    unique_top_traffic_ips: [] as string[],
    loading:                true,
  })

  /**
   * Mutable mirrors of the snapshot arrays.  Keeping refs allows the polling
   * callbacks (which capture a stale closure) to always read and write the
   * latest data without triggering re-renders on every intermediate update.
   */
  const recentBandwidthRef     = useRef<IBandwidth[]>([])
  const topTrafficBandwidthRef = useRef<IBandwidth[]>([])
  const recentIpsRef           = useRef<string[]>([])   // accumulates known source IPs
  const topTrafficIpsRef       = useRef<string[]>([])   // top-traffic IP list

  /** Set to true in the cleanup of the mount effect; guards against state
   *  updates on an unmounted component. */
  const isUnmountedRef         = useRef(false)
  /**
   * Monotonically increasing counter.  Incremented whenever the active filter
   * changes.  Every async operation captures the generation at start time and
   * bails out if it no longer matches, preventing stale results from a
   * superseded filter from overwriting fresh data.
   */
  const filterGenerationRef    = useRef(0)
  const activeFilterIdRef      = useRef(filterId)
  /** Concurrency guards — prevent overlapping poll calls for the same section. */
  const isRecentIPRunningRef   = useRef(false)
  const isTopTrafficRunningRef = useRef(false)

  /** Ref copies of frequently-read values used inside async callbacks to avoid
   *  stale closure issues without adding them to useCallback dependency arrays. */
  const timeRef              = useRef<ITimeSettings | null>(null)
  const paramsRef            = useRef(params)
  const searchByRef          = useRef<any>(searchBy)
  const pollingIntervalRef = useRef<number>(THREE_SECONDS_MS)

  const {socket} = useSocketConnection({channel_name, token})
  const getAccount = api.organizationAccount.getAccountID.useMutation();
  const getBandwidthActions = api.packet.getBandwidthOfSourceIP.useMutation()
  const getBandwidthTopTraffic  = api.packet.getBandwidthOfSourceIP.useMutation()
  const getUniqueSourceActions = api.packet.getUniqueSourceIP.useMutation()
  const getUniqueSourceTopTraffic = api.packet.getUniqueSourceIP.useMutation()

  /**
   * Ref wrappers for tRPC mutation objects.  tRPC recreates the mutation
   * object on every render; storing them in refs lets the polling callbacks
   * call the latest instance without being listed as effect dependencies
   * (which would restart intervals on every render).
   */
  const getBandwidthRef     = useRef(getBandwidthActions)
  const getBandwidthTopRef  = useRef(getBandwidthTopTraffic)
  const getUniqueIpRef      = useRef(getUniqueSourceActions)
  const getUniqueIpTopRef   = useRef(getUniqueSourceTopTraffic)

  /**
   * Stable refs to the latest poll functions.  The interval callbacks always
   * call through these refs so that interval IDs don't need to be recreated
   * each time the poll functions are redefined.
   */
  const pollRecentIPRef   = useRef<() => Promise<void>>(async () => {})
  const pollTopTrafficRef = useRef<() => Promise<void>>(async () => {})

  const { refetch: refetchTimeUnitandResolution } = api.cachedFilter.fetchCachedFilterTimeUnitandResolution.useQuery(
    {
      type: 'timeline_filter',
      filter_id: filterId,
    }, {
      enabled: false,
    }
  )

  /**
   * Interval (ms) for the "recent IPs" poll.  Shorter windows need more
   * frequent updates; larger windows tolerate a slower cadence.
   *   - second / 1-minute window → 1 s
   *   - other minute windows     → 5 s
   *   - hour windows             → 30 s
   */
  const pollingInterval = useMemo((): number => {
    if (!time) return ONE_SECOND_MS
    if (time.time_unit === 'second') return THREE_SECONDS_MS
    if (time.time_unit === 'minute') return FIVE_SECONDS_MS * time.time_count
    return THIRTY_SECONDS_MS * time.time_count
  }, [time])

  /**
   * Interval (ms) for the "top traffic" poll.  Top traffic changes more
   * slowly so it can be polled less aggressively than recent IPs.
   *   - second windows  → 5 s
   *   - minute windows  → 10 s
   *   - hour windows    → 60 s
   */
  const pollingIntervalTopTraffic = useMemo((): number => {
    if (!time) return FIVE_SECONDS_MS
    if (time.time_unit === 'second') return FIVE_SECONDS_MS
    if (time.time_unit === 'minute') return TEN_SECONDS_MS * time.time_count
    return ONE_MINUTE_MS * time.time_count
  }, [time])

  // ── Keep refs fresh on every render ──
  useEffect(() => { getBandwidthRef.current = getBandwidthActions }, [getBandwidthActions])
  useEffect(() => { getBandwidthTopRef.current = getBandwidthTopTraffic }, [getBandwidthTopTraffic])
  useEffect(() => { getUniqueIpRef.current = getUniqueSourceActions }, [getUniqueSourceActions])
  useEffect(() => { getUniqueIpTopRef.current = getUniqueSourceTopTraffic }, [getUniqueSourceTopTraffic])
  useEffect(() => { timeRef.current = time }, [time])
  useEffect(() => { paramsRef.current = params }, [params])
  useEffect(() => { searchByRef.current = searchBy }, [searchBy])
  useEffect(() => { pollingIntervalRef.current = pollingInterval }, [pollingInterval])
  useEffect(() => { activeFilterIdRef.current = filterId }, [filterId])

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  useEffect(() => {
    const _getAccount = async () => {
      const res = await getAccount.mutateAsync()
      
      const { organization_id, token } = res || {}
      setOrgAccountID(organization_id)
      setToken(token)
    }
    
    _getAccount()
  }, [])

  /**
   * Fetches the cached filter's time-unit and resolution from the server,
   * updates local state and the `timeRef`, broadcasts the new settings via the
   * event emitter, and returns them to the caller.
   *
   * Returns `null` if the component has unmounted or the filter generation has
   * changed since the request was kicked off (stale-result guard).
   */
  const fetchTimeSettings = useCallback(async (generation: number): Promise<ITimeSettings | null> => {
    const { data: time_unit_resolution } = await refetchTimeUnitandResolution()
    if (isUnmountedRef.current || generation !== filterGenerationRef.current) return null
    const { time: t, resolution = '1s' } = time_unit_resolution || {}
    const { time_count = 1, time_unit = 'hour' } = t || {}
    const settings: ITimeSettings = {
      time_count,
      time_unit: time_unit as ITimeSettings['time_unit'],
      // @ts-expect-error - No type yet
      resolution,
    }
    setTime(settings)
    timeRef.current = settings
    eventEmitter.emit('timeline_time_settings', settings)
    return settings
  }, [refetchTimeUnitandResolution, eventEmitter])

  /**
   * Performs the one-time full data load for a given filter + time settings.
   *
   * Sequence:
   * 1. Fetch unique source IPs for both "recent" and "top traffic" sections in
   *    parallel (using the full configured time range).
   * 2. Fetch per-IP bandwidth buckets for both sections in parallel.
   * 3. Enrich every entry with `total_bandwidths` / `total_active_packets` via
   *    `withTotal`, sort top-traffic by active packets, cap at 5.
   * 4. Write results to the mutable refs and commit to React state.
   * 5. Set `isInitialized = true` to start the polling intervals.
   *
   * Bails out silently on unmount or stale generation.
   */
  const performInitialLoad = useCallback(async (generation: number, fid: string, settings: ITimeSettings) => {
    const tr = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true }) as any
    const tr2 = getLastTimeStamp({ count: 1, unit: 'minute', add_remaining_time: true }) as any

    const [ips, topIps] = await Promise.all([
      getUniqueIpRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: settings.time_unit === 'hour' ? tr2 : tr,
        filter_id: fid,
      }) as Promise<string[]>,
      getUniqueIpTopRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: settings.time_unit === 'hour' ? tr2 : tr,
        filter_id: fid,
        limit: 5,
      }) as Promise<string[]>,
    ])
    if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

    const [bwResult, bwTopResult]: any[] = await Promise.all([
      getBandwidthRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: tr,
        bucket_size: settings.resolution,
        source_ips: ips,
      }),
      getBandwidthTopRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: tr,
        bucket_size: settings.resolution,
        source_ips: topIps,
      }),
    ])
    if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

    // Annotate each raw API item with the current time settings so consumers
    // can derive window boundaries without referencing global state.
    const toEntry = (item: Record<string, any>) => ({
      ...item,
      time_unit: settings.time_unit,
      time_count: settings.time_count,
      resolution: settings.resolution,
      time_range: tr,
    })

    const recentInitial = withTotal((bwResult?.data ?? []).map(toEntry))
    const topInitial = withTotal((bwTopResult?.data ?? []).map(toEntry))
      .sort((a, b) => (b.total_active_packets ?? 0) - (a.total_active_packets ?? 0))
      .slice(0, 5)

    recentBandwidthRef.current     = recentInitial
    topTrafficBandwidthRef.current  = topInitial
    recentIpsRef.current            = ips
    topTrafficIpsRef.current        = topInitial.map(e => e.source_ip)

    // startTransition(() => {
      setSnapshot({
        recentIPData:           recentInitial,
        topTrafficData:         topInitial,
        unique_source_ips:      ips,
        unique_top_traffic_ips: topTrafficIpsRef.current,
        loading:                false,
      })
      setIsInitialized(true)
    // })
  }, [])

  /**
   * Incremental poll for the "Recent IPs" section.  Runs on `pollingInterval`.
   *
   * Strategy:
   * - Only looks at the last 2 seconds of traffic (tight window catches new
   *   activity quickly without re-fetching the entire history).
   * - Merges any newly seen IPs into the accumulated `recentIpsRef` list, then
   *   fetches bandwidth buckets for the full merged set.
   * - Appends new time-buckets to existing entries (deduped by bucket key) so
   *   charts can animate new data arriving without a full repaint.
   * - Brands brand-new source IPs with `isNew: true`; clears the flag after
   *   1 s so the UI highlight fades automatically.
   * - Prunes buckets older than 60 resolution-intervals to bound memory growth.
   * - The `Promise.race` timeout (2 s) keeps the UI responsive when the server
   *   is slow; the poll simply skips that cycle rather than queuing up.
   */
  const pollRecentIP = useCallback(async () => {
    if (isRecentIPRunningRef.current) return
    const generation = filterGenerationRef.current
    const fid = activeFilterIdRef.current
    const settings = timeRef.current
    if (!settings) return

    isRecentIPRunningRef.current = true
    try {
      // Step back 1s leeway for connection insertion from Wallguard Agent
      // const recentCount = settings.time_unit === 'second' || (settings.time_unit === 'minute' && settings.time_count === 1) ? 3
      //   : settings.time_unit === 'minute' ? 7
      //   : 32
      // const tr = getLastTimeStamp({ count: recentCount, unit: 'second', add_remaining_time: true, _now: new Date(Date.now() - 1_000) }) as any
      const tr = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true,
        // _now: new Date(Date.now() - 1_000)
      }) as any

      const newIps = await Promise.race([
        getUniqueIpRef.current.mutateAsync({
          device_id: paramsRef.current?.id || '',
          time_range: tr,
          filter_id: fid,
        }) as Promise<string[]>,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('[recentIP] getUniqueIp timed out after 2s')), 2_000)),
      ])
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const mergedIps = [...new Set([...recentIpsRef.current, ...newIps])]

      const bwResult: any = await getBandwidthRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: tr,
        bucket_size: settings.resolution,
        source_ips: mergedIps,
      })
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const incoming: IBandwidth[] = (bwResult?.data ?? []).map((item: any) => ({
        ...item,
        time_unit: settings.time_unit,
        time_count: settings.time_count,
        resolution: settings.resolution,
      }))

      const existingMap = new Map(recentBandwidthRef.current.map(e => [e.source_ip, e]))
      const newEntries: IBandwidth[] = []

      // Append only buckets that are not already stored (incremental merge).
      const updatedExisting = recentBandwidthRef.current.map(entry => {
        const match = incoming.find(e => e.source_ip === entry.source_ip)
        if (!match) return entry
        const existingBuckets = new Set(entry.result.map(r => r.bucket))
        const freshResults = match.result.filter(r => !existingBuckets.has(r.bucket))
        return { ...entry, result: [...entry.result, ...freshResults] }
      })

      incoming.forEach(e => {
        if (!existingMap.has(e.source_ip)) newEntries.push({ ...e, isNew: true })
      })

      // Derive a sliding window of 60 resolution-intervals ending now to
      // evict stale buckets and keep the data set bounded.
      const resolutionValue = parseInt(settings.resolution.slice(0, -1))
      const resolutionUnit  = settings.resolution.slice(-1)
      const intervalMs = resolutionUnit === 'h' ? resolutionValue * 3_600_000
        : resolutionUnit === 'm' ? resolutionValue * 60_000
        : resolutionValue * 1_000
      const endDate   = new Date()
      const startDate = new Date(endDate.getTime() - 60 * intervalMs)

      const timeUnitMs     = settings.time_unit === 'hour' ? 3_600_000 : settings.time_unit === 'minute' ? 60_000 : 1_000
      const pruneThreshold = endDate.getTime() - settings.time_count * timeUnitMs * 2

      const result = withTotal([...newEntries, ...updatedExisting]
        .map(e => ({
          ...e,
          // result: e.result.filter(r => {
          //   const t = new Date(r.bucket.replace(' ', 'T')).getTime()
          //   return t >= startDate.getTime() && t <= endDate.getTime()
          // }),
          result: e.result.slice(0, 120)
        })))
        .filter((entry, index) => {
          // if (index < 10) return true
          const latestBucket = Math.max(
            0,
            ...entry.result.map(r => new Date(r.bucket.replace(' ', 'T')).getTime()),
          )
          return latestBucket >= pruneThreshold
        })

      recentBandwidthRef.current = result
      recentIpsRef.current = result.map(e => e.source_ip)

      // startTransition(() => {
        setSnapshot(prev => ({
          ...prev,
          recentIPData:      result,
          unique_source_ips: recentIpsRef.current,
        }))
      // })

      // Clear the `isNew` highlight after one polling interval.
      if (newEntries.length > 0) {
        const newIpList = newEntries.map(e => e.source_ip)
        window.setTimeout(() => {
          if (isUnmountedRef.current) return
          recentBandwidthRef.current = recentBandwidthRef.current.map(e =>
            newIpList.includes(e.source_ip) ? { ...e, isNew: false } : e,
          )
          // startTransition(() =>  {
            setSnapshot(prev => ({ ...prev, recentIPData: recentBandwidthRef.current }))
          // })
        }, pollingIntervalRef.current + 1_000)
      }
    } catch (err) {
      console.error('[recentIP] error:', err)
    } finally {
      isRecentIPRunningRef.current = false
    }
  }, [])

  /**
   * Incremental poll for the "Top Traffic" section.  Runs on
   * `pollingIntervalTopTraffic` (slower than the recent-IP poll).
   *
   * Mirrors the `pollRecentIP` strategy but with two differences:
   * - Fetches up to 5 unique IPs (the server-side `limit: 5` caps the query).
   * - After merging and pruning, re-sorts the full list by `total_active_packets`
   *   descending and keeps only the top 5, so the ranking stays accurate as
   *   traffic patterns shift.
   * - New entries are NOT flagged `isNew` here (top-traffic is ranked, not
   *   highlighted for recency).
   */
  const pollTopTraffic = useCallback(async () => {
    if (isTopTrafficRunningRef.current) return
    const generation = filterGenerationRef.current
    const fid = activeFilterIdRef.current
    const settings = timeRef.current
    if (!settings) return

    isTopTrafficRunningRef.current = true
    try {
      // Step back 1s leeway for connection insertion from Wallguard Agent
      const topCount = settings.time_unit === 'second' ? 7
        : settings.time_unit === 'minute' ? 12
        : 62
      // const tr = getLastTimeStamp({ count: topCount, unit: 'second', add_remaining_time: true, _now: new Date(Date.now() - 1_000) }) as any
      const tr = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true,
        // _now: new Date(Date.now() - 1_000)
      }) as any

      const newIps = await Promise.race([
        getUniqueIpTopRef.current.mutateAsync({
          device_id: paramsRef.current?.id || '',
          time_range: tr,
          filter_id: fid,
          limit: 5,
        }) as Promise<string[]>,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('[topTraffic] getUniqueIp timed out after 2s')), 2_000)),
      ])
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const mergedIps = [...new Set([...topTrafficIpsRef.current, ...newIps])]

      const bwResult: any = await getBandwidthTopRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: tr,
        bucket_size: settings.resolution,
        source_ips: mergedIps,
      })
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const incoming: IBandwidth[] = (bwResult?.data ?? []).map((item: any) => ({
        ...item,
        time_unit: settings.time_unit,
        time_count: settings.time_count,
        resolution: settings.resolution,
      }))

      const existingMap = new Map(topTrafficBandwidthRef.current.map(e => [e.source_ip, e]))
      const newEntries: IBandwidth[] = []

      // Append only new buckets to existing entries (incremental merge).
      const updatedExisting = topTrafficBandwidthRef.current.map(entry => {
        const match = incoming.find(e => e.source_ip === entry.source_ip)
        if (!match) return entry
        const existingBuckets = new Set(entry.result.map(r => r.bucket))
        const freshResults = match.result.filter(r => !existingBuckets.has(r.bucket))
        return { ...entry, result: [...entry.result, ...freshResults] }
      })

      incoming.forEach(e => {
        if (!existingMap.has(e.source_ip)) newEntries.push(e)
      })

      // Same sliding-window pruning as pollRecentIP.
      const resolutionValue = parseInt(settings.resolution.slice(0, -1))
      const resolutionUnit  = settings.resolution.slice(-1)
      const intervalMs = resolutionUnit === 'h' ? resolutionValue * 3_600_000
        : resolutionUnit === 'm' ? resolutionValue * 60_000
        : resolutionValue * 1_000
      const endDate        = new Date()
      const startDate      = new Date(endDate.getTime() - 60 * intervalMs)
      const timeUnitMs     = settings.time_unit === 'hour' ? 3_600_000 : settings.time_unit === 'minute' ? 60_000 : 1_000
      const pruneThreshold = endDate.getTime() - settings.time_count * timeUnitMs * 2

      // Re-rank by active packets and cap at 5 after every poll cycle.
      const sorted = withTotal([...updatedExisting, ...newEntries]
        .map(e => ({
          ...e,
          // result: e.result.filter(r => {
          //   const t = new Date(r.bucket.replace(' ', 'T')).getTime()
          //   return t >= startDate.getTime() && t <= endDate.getTime()
          // }),
          result: e.result.slice(0, 120)
        })))
        .sort((a, b) => (b.total_active_packets ?? 0) - (a.total_active_packets ?? 0))
        .filter((entry, index) => {
          // if (index < 5) return true
          const latestBucket = Math.max(
            0,
            ...entry.result.map(r => new Date(r.bucket.replace(' ', 'T')).getTime()),
          )
          return latestBucket >= pruneThreshold
        })

      topTrafficBandwidthRef.current = sorted
      topTrafficIpsRef.current = sorted.map(e => e.source_ip)

      // startTransition(() => {
        setSnapshot(prev => ({
          ...prev,
          topTrafficData:         sorted,
          unique_top_traffic_ips: topTrafficIpsRef.current,
        }))
      // })
    } catch (err) {
      console.error('[topTraffic] error:', err)
    } finally {
      isTopTrafficRunningRef.current = false
    }
  }, [])

  useEffect(() => { pollRecentIPRef.current = pollRecentIP }, [pollRecentIP])
  useEffect(() => { pollTopTrafficRef.current = pollTopTraffic }, [pollTopTraffic])

  useEffect(() => {
    if (!isInitialized) return
    const id = window.setInterval(() => void pollRecentIPRef.current(), pollingInterval)
    return () => window.clearInterval(id)
  }, [isInitialized, pollingInterval])

  useEffect(() => {
    if (!isInitialized) return
    const id = window.setInterval(() => void pollTopTrafficRef.current(), pollingIntervalTopTraffic)
    return () => window.clearInterval(id)
  }, [isInitialized, pollingIntervalTopTraffic])

  const fetchTimeSettingsRef    = useRef(fetchTimeSettings)
  const performInitialLoadRef   = useRef(performInitialLoad)
  useEffect(() => { fetchTimeSettingsRef.current = fetchTimeSettings }, [fetchTimeSettings])
  useEffect(() => { performInitialLoadRef.current = performInitialLoad }, [performInitialLoad])

  useEffect(() => {
    if (!filterId) return
    const generation = filterGenerationRef.current
    const fid = filterId

    setIsInitialized(false)
    recentBandwidthRef.current     = []
    topTrafficBandwidthRef.current  = []
    recentIpsRef.current            = []
    topTrafficIpsRef.current        = []
    isRecentIPRunningRef.current    = false
    isTopTrafficRunningRef.current  = false
    setSnapshot(prev => ({ ...prev, loading: true }))

    void (async () => {
      const settings = await fetchTimeSettingsRef.current(generation)
      if (!settings) return
      await performInitialLoadRef.current(generation, fid, settings)
    })()
  }, [filterId, (searchBy ?? [])?.length])

  useEffect(() => {
    if (!eventEmitter) return

    const setFID = (data: any) => {
      if (typeof data !== 'string') return
      if (data === activeFilterIdRef.current) return
      filterGenerationRef.current += 1
      setFilterID(data)
    }
    const setSBy = (data: any) => {
      setSearchBy(data)
    }

    const handleRefresh = async (data: boolean) => {
      if (!data) return
      const generation = filterGenerationRef.current
      const fid = activeFilterIdRef.current

      setIsInitialized(false)
      isRecentIPRunningRef.current   = false
      isTopTrafficRunningRef.current = false
      recentBandwidthRef.current     = []
      topTrafficBandwidthRef.current  = []
      setSnapshot(prev => ({ ...prev, loading: true }))

      const settings = await fetchTimeSettingsRef.current(generation)
      if (!settings) return
      await performInitialLoadRef.current(generation, fid, settings)
    }

    eventEmitter.on(`timeline_filter_id`, setFID)
    eventEmitter.on('timeline_search', setSBy)
    eventEmitter.on('should_refresh_timeline_filter', handleRefresh)
    return () => {
      eventEmitter.off(`timeline_filter_id`, setFID)
      eventEmitter.off(`timeline_search`, setSBy)
      eventEmitter.off('should_refresh_timeline_filter', handleRefresh)
    }
  }, [eventEmitter, filterId])

  useEffect(() => {
    if (!eventEmitter) return
    const handleRequest = () => {
      const { time_count = null, time_unit = null, resolution = null } = time || {}
      if (time_count && time_unit && resolution) {
        eventEmitter.emit('timeline_time_settings', { time_count, time_unit, resolution })
      }
    }
    eventEmitter.on('timeline_request_time_settings', handleRequest)
    return () => {
      eventEmitter.off('timeline_request_time_settings', handleRequest)
    }
  }, [eventEmitter, time])

  useEffect(() => {
    if (!filterId) return

    eventEmitter.emit('timeline_filter_id_active_label', filterId)
  }, [filterId])

  useEffect(() => {
    eventEmitter.emit('timeline_chart_data', snapshot.recentIPData)
  }, [snapshot.recentIPData, eventEmitter])

  useEffect(() => {
    eventEmitter.emit('timeline_loading', snapshot.loading)
  }, [snapshot.loading, eventEmitter])

  useEffect(() => {
    if (!socket || !org_acc_id || filterId !== '01JNQ9WPA2JWNTC27YCTCYC1FE') return

    const eventKey = `${channel_name}-${params?.id}-${org_acc_id}`
    socket.on(eventKey, async (data: any) => {
      const updated = await updateBandwidth(recentBandwidthRef.current, data, timeRef.current, searchByRef.current)
      recentBandwidthRef.current = withTotal([...updated] as IBandwidth[])
      const newIps = updated
        .filter((e: any) => e?.isNew)
        .map((e: any) => e?.source_ip)
        .filter(Boolean) as string[]
      // startTransition(() => {
        setSnapshot(prev => ({ ...prev, recentIPData: recentBandwidthRef.current }))
      // })
      if (newIps.length > 0) {
        window.setTimeout(() => {
          if (isUnmountedRef.current) return
          recentBandwidthRef.current = recentBandwidthRef.current.map(e =>
            newIps.includes(e.source_ip) ? { ...e, isNew: false } : e,
          )
          // startTransition(() => {
            setSnapshot(prev => ({ ...prev, recentIPData: recentBandwidthRef.current }))
          // })
        }, pollingIntervalRef.current + 1_000)
      }
    })

    return () => { socket.off(eventKey) }
  }, [socket, org_acc_id])

  /**
   * Context value exposed to consumers via `useFetchNetworkFlow`.
   * `flowData` and `chartData` are aliases for `recentIPData` kept for
   * backwards-compatibility with existing consumer components.
   * `fetchMoreData` is a no-op placeholder; pagination is not implemented.
   */
  const state = {
    flowData:                  snapshot.recentIPData,
    topTrafficData:            snapshot.topTrafficData,
    recentIPData:              snapshot.recentIPData,
    pollingIntervalTopTraffic,
    pollingIntervalRecentIP:   pollingInterval,
    loading:                   snapshot.loading,
    unique_source_ips:         snapshot.unique_source_ips,
    unique_top_traffic_ips:    snapshot.unique_top_traffic_ips,
    fetchMoreData:             () => {},
    chartData:                 snapshot.recentIPData,
  } as any

  return (
    <NetworkFlowContext.Provider
      value={{
        state,
      } }
    >
      {children}
    </NetworkFlowContext.Provider>
  )
}

export const useFetchNetworkFlow = (): INetworkFlowContext => {
  const context = useContext(NetworkFlowContext)
  if (!context) {
    console.warn('use Fetch Network Flow must be used within a NetworkFlowProvider')
    throw new Error('use Fetch Network Flow must be used within a NetworkFlowProvider')
  }

  return context
}
