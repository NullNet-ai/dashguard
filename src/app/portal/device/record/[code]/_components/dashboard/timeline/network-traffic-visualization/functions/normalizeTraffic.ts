export const normalizeTraffic = (traffic: number, maxTraffic: number) => {
  if (maxTraffic <= 0) return 0
  return Math.log(1 + traffic) / Math.log(1 + maxTraffic)
}
