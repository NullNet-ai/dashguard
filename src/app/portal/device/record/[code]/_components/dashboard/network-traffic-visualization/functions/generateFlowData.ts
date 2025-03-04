import { Edge, IBandwidth, Element } from '../types'
import { formatBandwidth } from './formatBandwidth'
import { normalizeTraffic } from './normalizeTraffic'

export const generateFlowData = (bandwidthData: Record<string, any>): { nodes: Element[], edges: Edge[] } => {
  const nodes: Element[] = []
  const edges: Edge[] = []
  let maxBandwidth = 0

  const uniqueSourceIPsSet = new Set()
  const uniqueDestIPsSet = new Set()
  const sourceIPMap = new Map()
  const destIPToFlowMap = new Map()

  bandwidthData.forEach(({ source_ip, destination_ip, result }: IBandwidth, flowIndex: number) => {
    if (!sourceIPMap.has(source_ip)) {
      sourceIPMap.set(source_ip, uniqueSourceIPsSet.size)
      uniqueSourceIPsSet.add(source_ip)
    }

    if (!destIPToFlowMap.has(destination_ip)) {
      destIPToFlowMap.set(destination_ip, flowIndex)
      uniqueDestIPsSet.add(destination_ip)
    }

    result.forEach(({ bandwidth }: { bandwidth: string }) => {
      const bwValue = parseInt(bandwidth, 10)
      maxBandwidth = Math.max(maxBandwidth, bwValue)
    })
  })

  const spacing = 150
  uniqueSourceIPsSet.forEach((sourceIP) => {
    const yPos = sourceIPMap.get(sourceIP) * spacing
    nodes.push({
      id: sourceIP as unknown as string,
      type: 'ipNode',
      position: { x: 0, y: yPos },
      data: { label: sourceIP, type: 'source' },
    })
  })

  bandwidthData.forEach(({ source_ip, destination_ip, result }: IBandwidth, flowIndex: number) => {
    const destY = destIPToFlowMap.get(destination_ip) * spacing
    let xPosition = spacing

    const trafficNodes = result.map(({ bandwidth }: { bandwidth: string }, timeIndex: number) => {
      const bwValue = parseInt(bandwidth, 10) as number
      const trafficNodeId = `traffic-${source_ip}-${destination_ip}-${timeIndex}-${flowIndex}`
      const normalizedValue = normalizeTraffic(bwValue, maxBandwidth)
      const _maxBandwidth = formatBandwidth(bwValue.toString())

      const minWidth = 20
      const maxWidth = 150
      const width = minWidth + (maxWidth - minWidth) * normalizedValue

      nodes.push({
        id: trafficNodeId,
        type: 'trafficNode',
        position: { x: xPosition, y: destY },
        data: {
          normalizedValue,
          width,
          _maxBandwidth: parseInt(_maxBandwidth),
        },
      })

      xPosition += spacing
      return trafficNodeId
    })

    if (destIPToFlowMap.get(destination_ip) === flowIndex) {
      nodes.push({
        id: `dest-${destination_ip}`,
        type: 'ipNode',
        position: { x: xPosition, y: destY },
        data: { label: destination_ip, type: 'destination' },
      })
    }

    if (trafficNodes.length > 0) {
      edges.push({
        id: `edge-${source_ip}-${trafficNodes[0]}-${flowIndex}`,
        source: source_ip,
        target: trafficNodes[0],
        animated: true,
        style: { strokeWidth: 1 },
        type: 'smoothstep',
      })

      for (let i = 0; i < trafficNodes.length - 1; i++) {
        edges.push({
          id: `edge-${trafficNodes[i]}-${trafficNodes[i + 1]}`,
          source: trafficNodes[i],
          target: trafficNodes[i + 1],
          animated: true,
          style: { strokeWidth: 1 },
          type: 'smoothstep',
        })
      }

      edges.push({
        id: `edge-${trafficNodes[trafficNodes.length - 1]}-${destination_ip}-${flowIndex}`,
        source: trafficNodes[trafficNodes.length - 1],
        target: `dest-${destination_ip}`,
        animated: true,
        style: { strokeWidth: 1 },
        type: 'smoothstep',
      })
    }
  })

  return { nodes, edges }
}
