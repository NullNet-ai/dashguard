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
