export interface Element {
  id: string
  data: any
  type: string
  position: {
    x: number
    y: number }
}

export interface Edge {
  id: string
  source: string
  target: string
  type: string
  animated: boolean
  style: {
    strokeWidth: number
  }
}

export interface FlowElement {
  id: string
  type: string
  data: any
  position: { x: number, y: number }

}

export interface IBandwidthBucket {
  bucket: string
  bandwidth: string
}

export interface IBandwidth {
  source_ip: string
  result: IBandwidthBucket[]
  flag: string
  name: string
  country: string
  time_unit: string
  time_count: number
  resolution: string
  time_range: [string, string]
  total_bandwidths: number
  total_active_packets: number
  isNew?: boolean
}

/** Raw item returned by the bandwidth API before we overlay the local time settings. */
export interface IRawBandwidthItem extends Omit<IBandwidth, 'time_unit' | 'time_count' | 'resolution'> {}

export interface IState {
  flowData: any[]
  topTrafficData: IBandwidth[]
  recentIPData: IBandwidth[]
  pollingIntervalTopTraffic: number
  pollingIntervalRecentIP: number
  loading: boolean
  fetchMoreData: () => any
  unique_source_ips: string[]
  flagDetails: {
    name: string
    flag: string
  }
  fetchBandwidthLoading?: boolean
  ipPollTick: number
}

export interface IAction {
  handleQueryPackets?: (data: any) => void
  handleQueryBandwidth?: (data: any) => void
  handleQueryTraffic?: (data: any) => void
}

export interface INetworkFlowContext {
  state?: IState
  actions?: IAction
}

export interface Tick {
  isMajor:  boolean
  label:    string
  position: 'first' | 'middle' | 'last' | 'none'
}
