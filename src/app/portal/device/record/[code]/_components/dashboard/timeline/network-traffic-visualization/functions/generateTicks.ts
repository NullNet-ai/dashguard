export const generateTicks = (value: number) => {
  const maxValue = Math.ceil(value * 1.2)
  const tickCount = 5
  return Array.from({ length: tickCount + 1 }, (_, i) => (maxValue / tickCount) * i)
}