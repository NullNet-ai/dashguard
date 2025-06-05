import L from "leaflet"
import { getConditionColor } from "./getConditionColor"
import { getTrafficColor } from "./getTrafficColor"
import { DEFAULT_SEA_COORDINATES } from "./normalizeLatLng"

export const createCurvedFlowLine = (fromCoord: any, toCoord: any, trafficLevel: any, name: any, condition = null) => {
  if (!fromCoord && !toCoord) {
    console.error(`Missing coordinates for connection: ${name}`)
    return null
  }

  const adjustedFromCoord = fromCoord || DEFAULT_SEA_COORDINATES
  const adjustedToCoord = toCoord || DEFAULT_SEA_COORDINATES

  const curvePoints: any = []
  const segments = 50

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = adjustedFromCoord[1] * (1 - t) + adjustedToCoord[1] * t
    const y
      = adjustedFromCoord[0] * (1 - t)
        + adjustedToCoord[0] * t
        + Math.sin(Math.PI * t) * 20

    curvePoints.push([y, x])
  }

  const lineColor = condition ? getConditionColor(condition) : getTrafficColor(trafficLevel)

  return L.polyline(curvePoints, {
    color: lineColor,
    weight: 3,
    opacity: 0.8,
    // dashArray: '5, 5',
  })
}