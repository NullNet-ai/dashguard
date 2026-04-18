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

import { type IBandwidth, type IRawBandwidthItem, type INetworkFlowContext } from './types'
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
    ipPollTick:             0,  // increments every time pollIPs completes; drives sharedNow in View
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
  const isRecentBandwidthRunningRef = useRef(false)
  const isTopBandwidthRunningRef    = useRef(false)
  const isRecentIPRunningRef        = useRef(false)
  const isTopTrafficRunningRef      = useRef(false)

  /** Ref copies of frequently-read values used inside async callbacks to avoid
   *  stale closure issues without adding them to useCallback dependency arrays. */
  const timeRef              = useRef<ITimeSettings | null>(null)
  const paramsRef            = useRef(params)
  const searchByRef          = useRef<any>(searchBy)
  const pollingIntervalRef             = useRef<number>(THREE_SECONDS_MS)
  const pollingIntervalTopTrafficRef   = useRef<number>(FIVE_SECONDS_MS)

  const {socket} = useSocketConnection({channel_name, token})
  const getAccount = api.organizationAccount.getAccountID.useMutation();
  const getBandwidthActions = api.packet.getBandwidthOfSourceIP.useMutation()
  const getBandwidthTopTraffic  = api.packet.getBandwidthOfSourceIP.useMutation()
  const getUniqueSourceActions = api.packet.getUniqueSourceIP.useMutation()
  const getUniqueSourceTopTraffic = api.packet.getUniqueSourceIP.useMutation()
  const saveNetworkTrafficIPsMutation = api.packet.saveNetworkTrafficIPs.useMutation()
  const getNetworkTrafficIPsMutation  = api.packet.getNetworkTrafficIPs.useMutation()

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
  const saveNetworkTrafficIPsRef = useRef(saveNetworkTrafficIPsMutation)
  const getNetworkTrafficIPsRef  = useRef(getNetworkTrafficIPsMutation)
  const lastSavedRef             = useRef<number>(0)

  /**
   * Stable refs to the latest poll functions.  The interval callbacks always
   * call through these refs so that interval IDs don't need to be recreated
   * each time the poll functions are redefined.
   */
  const pollRecentBandwidthRef = useRef<() => Promise<void>>(async () => {})
  const pollTopBandwidthRef    = useRef<() => Promise<void>>(async () => {})
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
  useEffect(() => { saveNetworkTrafficIPsRef.current = saveNetworkTrafficIPsMutation }, [saveNetworkTrafficIPsMutation])
  useEffect(() => { getNetworkTrafficIPsRef.current  = getNetworkTrafficIPsMutation  }, [getNetworkTrafficIPsMutation])
  useEffect(() => { timeRef.current = time }, [time])
  useEffect(() => { paramsRef.current = params }, [params])
  useEffect(() => { searchByRef.current = searchBy }, [searchBy])
  useEffect(() => { pollingIntervalRef.current           = pollingInterval           }, [pollingInterval])
  useEffect(() => { pollingIntervalTopTrafficRef.current = pollingIntervalTopTraffic }, [pollingIntervalTopTraffic])
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

  const saveIPsToCache = useCallback((recentIps: string[], topIps: string[], force = false) => {
    const now = Date.now()
    if (!force && now - lastSavedRef.current < 1_000) return
    const deviceId = paramsRef.current?.id
    const fid = activeFilterIdRef.current
    if (!deviceId || !fid) return
    lastSavedRef.current = now
    saveNetworkTrafficIPsRef.current.mutate(
      {
        device_id: deviceId,
        filter_id: fid,
        recent_ips: recentIps.slice(0, 10),
        top_ips: topIps.slice(0, 5),
        recent_ttl: Math.min(300, Math.max(1, Math.round(pollingIntervalRef.current / 1_000)) + 15),
        top_ttl: Math.min(300, Math.max(1, Math.round(pollingIntervalTopTrafficRef.current / 1_000)) + 15),
      },
      {
        onError: (err) => {
          if (isUnmountedRef.current) return
          console.error('[saveIPsToCache] Redis write failed', err)
        },
      }
    )
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
    const timeRange = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true,
      _now: new Date(new Date(Date.now() - 10_000))
    }) as any
    const tr2 = getLastTimeStamp({ count: 1, unit: 'minute', add_remaining_time: true }) as any

    if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

    // 1. Check Redis cache first — skip expensive IP discovery on cache hit
    const cachedIPs = await getNetworkTrafficIPsRef.current.mutateAsync({
      device_id: paramsRef.current?.id || '',
      filter_id: fid,
    })
    if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

    let ips: string[]
    let topIps: string[]

    if ((!searchByRef.current || searchByRef.current.length === 0) && cachedIPs?.data) {
      // Cache hit — use cached IPs directly, skip getUniqueSourceIP queries
      ips    = cachedIPs.data.recent_ips
      topIps = cachedIPs.data.top_ips
    } else {
      // Cache miss — discover IPs from the data store
      const [fetchedIps, fetchedTopIps] = await Promise.all([
        getUniqueIpRef.current.mutateAsync({
          device_id: paramsRef.current?.id || '',
          time_range: settings.time_unit === 'hour' ? tr2 : timeRange,
          filter_id: fid,
        }) as Promise<string[]>,
        getUniqueIpTopRef.current.mutateAsync({
          device_id: paramsRef.current?.id || '',
          time_range: settings.time_unit === 'hour' ? tr2 : timeRange,
          filter_id: fid,
          limit: 5,
        }) as Promise<string[]>,
      ])
      ips    = fetchedIps
      topIps = fetchedTopIps
      // Save freshly discovered IPs to Redis immediately so the next refresh can skip discovery
      saveIPsToCache(ips, topIps, true)
    }

    if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

    const [bwResult, bwTopResult]: any[] = await Promise.all([
      getBandwidthRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: timeRange,
        bucket_size: settings.resolution,
        source_ips: ips,
      }),
      getBandwidthTopRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: timeRange,
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
      time_range: timeRange,
    })

    const recentInitial = withTotal((bwResult?.data ?? []).map(toEntry)).slice(0, 60)
    const topInitial = withTotal((bwTopResult?.data ?? []).map(toEntry))
      .sort((a, b) => {
        const byPackets = (b.total_active_packets ?? 0) - (a.total_active_packets ?? 0)
        return byPackets !== 0 ? byPackets : (b.total_bandwidths ?? 0) - (a.total_bandwidths ?? 0)
      })
      .slice(0, 60)

    recentBandwidthRef.current     = recentInitial
    topTrafficBandwidthRef.current  = topInitial
    recentIpsRef.current            = ips
    topTrafficIpsRef.current        = topInitial.map(e => e.source_ip)

    // startTransition(() => {
      setSnapshot(prev => ({
        ...prev,
        recentIPData:           recentInitial,
        topTrafficData:         topInitial,
        unique_source_ips:      ips,
        unique_top_traffic_ips: topTrafficIpsRef.current,
        loading:                false,
      }))
      setIsInitialized(true)
    // })
  }, [saveIPsToCache])

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
      const tr = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true }) as any

      const newIps = await Promise.race([
        getUniqueIpRef.current.mutateAsync({
          device_id: paramsRef.current?.id || '',
          time_range: tr,
          filter_id: fid,
        }) as Promise<string[]>,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('[recentIP] getUniqueIp timed out after 2s')), 2_000)),
      ])
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const previousRecentIps = new Set(recentIpsRef.current)
      recentIpsRef.current = [...new Set([...recentIpsRef.current, ...newIps])]
      saveIPsToCache(recentIpsRef.current, topTrafficIpsRef.current)
      const hasNewRecentIps = newIps.some(ip => !previousRecentIps.has(ip))
      if (hasNewRecentIps) {
        void pollRecentBandwidthRef.current()
      }
    } catch (err) {
      console.error('[recentIP] error:', err)
    } finally {
      isRecentIPRunningRef.current = false
    }
  }, [saveIPsToCache])

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
      const tr = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true }) as any

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

      topTrafficIpsRef.current = [...new Set([...topTrafficIpsRef.current, ...newIps])]
      saveIPsToCache(recentIpsRef.current, topTrafficIpsRef.current)
    } catch (err) {
      console.error('[topTraffic] error:', err)
    } finally {
      isTopTrafficRunningRef.current = false
    }
  }, [saveIPsToCache])

  /** Bandwidth poll for the Recent IP section — runs every 3 s. */
  const pollRecentBandwidth = useCallback(async () => {
    if (isRecentBandwidthRunningRef.current) return
    const generation = filterGenerationRef.current
    const settings = timeRef.current
    if (!settings) return

    isRecentBandwidthRunningRef.current = true
    try {
      const timeRange = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true,
        _now: new Date(Date.now() - 10_000)
      })

      const bwResult: any = await getBandwidthRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: timeRange as any,
        bucket_size: settings.resolution,
        source_ips: recentIpsRef.current,
      })
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const endDate        = new Date()
      const timeUnitMs     = settings.time_unit === 'hour' ? 3_600_000 : settings.time_unit === 'minute' ? 60_000 : 1_000
      const pruneThreshold = endDate.getTime() - settings.time_count * timeUnitMs * 2

      const incoming: IBandwidth[] = (bwResult?.data ?? []).map((item: IRawBandwidthItem) => ({
        ...item,
        time_unit: settings.time_unit,
        time_count: settings.time_count,
        resolution: settings.resolution,
      }))

      const existingMap = new Map(recentBandwidthRef.current.map(e => [e.source_ip, e]))

      const updated = recentBandwidthRef.current.map(entry => {
        const match = incoming.find(e => e.source_ip === entry.source_ip)
        if (!match) return entry
        const existingBuckets = new Set(entry.result.map(r => r.bucket))
        const freshResults = match.result.filter(r => !existingBuckets.has(r.bucket))
        return { ...entry, result: [...entry.result, ...freshResults] }
      })

      const newEntries = incoming
        .filter(e => !existingMap.has(e.source_ip))
        .map(e => ({ ...e, isNew: true as const }))

      const result = withTotal([...newEntries, ...updated]
        .map(e => ({ ...e, result: e.result.slice(0, 60) })))
        .filter(entry => {
          const latestBucket = Math.max(0, ...entry.result.map(r => new Date(r.bucket.replace(' ', 'T')).getTime()))
          return latestBucket >= pruneThreshold
        })

      recentBandwidthRef.current = result
      recentIpsRef.current       = result.map(e => e.source_ip)
      saveIPsToCache(recentIpsRef.current, topTrafficIpsRef.current)

      setSnapshot(prev => ({
        ...prev,
        recentIPData:      result,
        unique_source_ips: recentIpsRef.current,
      }))

      if (newEntries.length > 0) {
        const newIpList = newEntries.map(e => e.source_ip)
        window.setTimeout(() => {
          if (isUnmountedRef.current) return
          recentBandwidthRef.current = recentBandwidthRef.current.map(e =>
            newIpList.includes(e.source_ip) ? { ...e, isNew: false } : e,
          )
          setSnapshot(prev => ({ ...prev, recentIPData: recentBandwidthRef.current }))
        }, THREE_SECONDS_MS + 1_000)
      }
    } catch (err) {
      console.error('[recentBandwidth] error:', err)
    } finally {
      isRecentBandwidthRunningRef.current = false
    }
  }, [saveIPsToCache])

  /** Bandwidth poll for the Top Traffic section — runs every 3 s. */
  const pollTopBandwidth = useCallback(async () => {
    if (isTopBandwidthRunningRef.current) return
    const generation = filterGenerationRef.current
    const settings = timeRef.current
    if (!settings) return

    isTopBandwidthRunningRef.current = true
    try {
      const timeRange = getLastTimeStamp({ count: settings.time_count, unit: settings.time_unit, add_remaining_time: true,
        _now: new Date(Date.now() - 3_000)
      })

      const bwResult: any = await getBandwidthTopRef.current.mutateAsync({
        device_id: paramsRef.current?.id || '',
        time_range: timeRange as any,
        bucket_size: settings.resolution,
        source_ips: topTrafficIpsRef.current,
      })
      if (isUnmountedRef.current || generation !== filterGenerationRef.current) return

      const endDate        = new Date()
      const timeUnitMs     = settings.time_unit === 'hour' ? 3_600_000 : settings.time_unit === 'minute' ? 60_000 : 1_000
      const pruneThreshold = endDate.getTime() - settings.time_count * timeUnitMs * 2

      const incoming: IBandwidth[] = (bwResult?.data ?? []).map((item: IRawBandwidthItem) => ({
        ...item,
        time_unit: settings.time_unit,
        time_count: settings.time_count,
        resolution: settings.resolution,
      }))

      const existingMap = new Map(topTrafficBandwidthRef.current.map(e => [e.source_ip, e]))

      const updated = topTrafficBandwidthRef.current.map(entry => {
        const match = incoming.find(e => e.source_ip === entry.source_ip)
        if (!match) return entry
        const existingBuckets = new Set(entry.result.map(r => r.bucket))
        const freshResults = match.result.filter(r => !existingBuckets.has(r.bucket))
        return { ...entry, result: [...entry.result, ...freshResults] }
      })

      const newEntries = incoming.filter(e => !existingMap.has(e.source_ip))

      const sorted = withTotal([...updated, ...newEntries]
        .map(e => ({ ...e, result: e.result.slice(0, 60) })))
        .sort((a, b) => {
          const byPackets = (b.total_active_packets ?? 0) - (a.total_active_packets ?? 0)
          return byPackets !== 0 ? byPackets : (b.total_bandwidths ?? 0) - (a.total_bandwidths ?? 0)
        })
        .filter(entry => {
          const latestBucket = Math.max(0, ...entry.result.map(r => new Date(r.bucket.replace(' ', 'T')).getTime()))
          return latestBucket >= pruneThreshold
        })

      topTrafficBandwidthRef.current = sorted
      topTrafficIpsRef.current       = sorted.map(e => e.source_ip)
      saveIPsToCache(recentIpsRef.current, topTrafficIpsRef.current)

      setSnapshot(prev => ({
        ...prev,
        topTrafficData:         sorted,
        unique_top_traffic_ips: topTrafficIpsRef.current,
      }))
    } catch (err) {
      console.error('[topBandwidth] error:', err)
    } finally {
      isTopBandwidthRunningRef.current = false
    }
  }, [saveIPsToCache])

  useEffect(() => { pollRecentBandwidthRef.current = pollRecentBandwidth }, [pollRecentBandwidth])
  useEffect(() => { pollTopBandwidthRef.current    = pollTopBandwidth    }, [pollTopBandwidth])
  useEffect(() => { pollRecentIPRef.current        = pollRecentIP        }, [pollRecentIP])
  useEffect(() => { pollTopTrafficRef.current      = pollTopTraffic      }, [pollTopTraffic])

  useEffect(() => {
    if (!isInitialized) return
    const id = window.setInterval(() => {
      setSnapshot(prev => ({ ...prev, ipPollTick: (prev.ipPollTick + 1) % 1_000_000 }))
    }, ONE_SECOND_MS)
    return () => window.clearInterval(id)
  }, [isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    const id = window.setInterval(() => void pollRecentBandwidthRef.current(), THREE_SECONDS_MS)
    return () => window.clearInterval(id)
  }, [isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    const id = window.setInterval(() => void pollTopBandwidthRef.current(), THREE_SECONDS_MS)
    return () => window.clearInterval(id)
  }, [isInitialized])

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
    isRecentBandwidthRunningRef.current = false
    isTopBandwidthRunningRef.current    = false
    isRecentIPRunningRef.current        = false
    isTopTrafficRunningRef.current      = false
    setSnapshot(prev => ({ ...prev, topTraficData: [], recentIPData: [], loading: true }))

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
      isRecentBandwidthRunningRef.current = false
      isTopBandwidthRunningRef.current    = false
      isRecentIPRunningRef.current        = false
      isTopTrafficRunningRef.current      = false
      recentBandwidthRef.current     = []
      topTrafficBandwidthRef.current = []
      recentIpsRef.current           = []
      topTrafficIpsRef.current       = []
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
    ipPollTick:                snapshot.ipPollTick,
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
