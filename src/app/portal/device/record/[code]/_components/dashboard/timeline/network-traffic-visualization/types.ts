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

export interface IBandwidth {
  source_ip: string
  destination_ip: string
  result: Record<string, any>
}

export interface IState {
  elements: { nodes: FlowElement[], edges: Edge[] }
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
