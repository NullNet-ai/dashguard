import { type Element, type Edge, type IBandwidth } from '../types'

import { formatBandwidth } from './formatBandwidth'
import { normalizeTraffic } from './normalizeTraffic'

export const generateFlowData = (bandwidthData: IBandwidth[]): { nodes: Element[], edges: Edge[] } => {
  const nodes: Element[] = []
  const edges: Edge[] = []
  let maxBandwidth = 0
  const normalizedData = normalizeNetworkData(bandwidthData)

  const uniqueSourceIPsSet = new Set()
  const sourceIPMap = new Map()

  normalizedData?.forEach(({ source_ip, result }: any) => {
    if (!sourceIPMap.has(source_ip)) {
      sourceIPMap.set(source_ip, uniqueSourceIPsSet.size)
      uniqueSourceIPsSet.add(source_ip)
    }

    result.forEach(({ bandwidth }: { bandwidth: string }) => {
      const bwValue = parseInt(bandwidth, 10)
      maxBandwidth = Math.max(maxBandwidth, bwValue)
    })
  })

  const spacing = 100
  uniqueSourceIPsSet.forEach((sourceIP) => {
    const yPos = sourceIPMap.get(sourceIP) * spacing
    nodes.push({
      id: sourceIP as unknown as string,
      type: 'ipNode',
      position: { x: 0, y: yPos },
      data: { label: sourceIP, type: 'source' },
    })
  })

  normalizedData?.forEach(({ source_ip, result }: any, flowIndex: number) => {
    let xPosition = spacing
    const trafficNodes = result.map(({ bandwidth, widthPercentage, widthPixels }: { bandwidth: string, widthPercentage: number, widthPixels: number }, timeIndex: number) => {
      const bwValue = parseInt(bandwidth, 10) as number
      const trafficNodeId = `traffic-${source_ip}-${timeIndex}-${flowIndex}`
      const normalizedValue = normalizeTraffic(bwValue, maxBandwidth)
      const _maxBandwidth = formatBandwidth(bwValue.toString())


      const minWidth = 20
      const maxWidth = 150
      const width = minWidth + (maxWidth - minWidth) * normalizedValue

      const xPos = (timeIndex === 0 ? xPosition + 350 : xPosition ) 


      nodes.push({
        id: trafficNodeId,
        type: 'trafficNode',
        position: { x: xPos, y: sourceIPMap.get(source_ip) * spacing },
        data: {
          bandwidth,
          normalizedValue,
          newWidth: widthPercentage,
          widthPixels:  widthPixels,
          width,
          _maxBandwidth: parseInt(_maxBandwidth),
        },
      })

      if(timeIndex === 0) {
        xPosition += (350 + widthPixels + 50)
      }else {
        xPosition += widthPixels + 50
      }
      return trafficNodeId
    })

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
    }
  })

  return { nodes, edges }
}


function normalizeNetworkData(data: any[]) {
  const MAX_PIXEL_WIDTH = 500; // Maximum width in pixels for 100%
  
  // First, find the maximum bandwidth value across all results
  const maxBandwidth = data.reduce((max, item) => {
    const itemMax = item.result.reduce((subMax: any, entry: any) => {
      const bandwidth = parseInt(entry.bandwidth, 10);
      return Math.max(subMax, bandwidth);
    }, 0);
    return Math.max(max, itemMax);
  }, 0);

  // Normalize the data with percentages and pixel widths
  return data.map(item => ({
    source_ip: item.source_ip,
    result: item.result.map((entry: any) => ({
      bucket: entry.bucket,
      bandwidth: parseInt(entry.bandwidth, 10),
      // Calculate percentage width (0-100)
      widthPercentage: (parseInt(entry.bandwidth, 10) / maxBandwidth) * 100,
      // Calculate pixel width (0-500)
      widthPixels: Math.round((parseInt(entry.bandwidth, 10) / maxBandwidth) * MAX_PIXEL_WIDTH)
    }))
  }));
}