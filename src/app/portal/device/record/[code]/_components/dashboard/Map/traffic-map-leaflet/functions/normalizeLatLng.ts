export const DEFAULT_SEA_COORDINATES: [number, number] = [0, -30]

export function normalizeLatLng(coord: any): [number, number] {
  if (!coord) return DEFAULT_SEA_COORDINATES;
  if (Array.isArray(coord) && coord.length === 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number') {
    return [coord[0], coord[1]];
  }
  // Leaflet LatLng object
  if (coord.lat !== undefined && coord.lng !== undefined) return [coord.lat, coord.lng];
  // Leaflet LatLngLiteral
  if (coord.latitude !== undefined && coord.longitude !== undefined) return [coord.latitude, coord.longitude];
  return DEFAULT_SEA_COORDINATES;
}