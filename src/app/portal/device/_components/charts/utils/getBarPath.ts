export const chartData = [
  { hour: '1 hour', heartbeats: 100 },
  { hour: '2 hours', heartbeats: 0 },
  { hour: '3 hours', heartbeats: 0 },
  { hour: '4 hours', heartbeats: 0 },
  { hour: '5 hours', heartbeats: 100 },
  { hour: '6 hours', heartbeats: 100 },
  { hour: '7 hours', heartbeats: 100 },
  { hour: '8 hours', heartbeats: 100 },
  { hour: '9 hours', heartbeats: 0 },
  { hour: '10 hours', heartbeats: 100 },
  { hour: '11 hours', heartbeats: 100 },
  { hour: '12 hours', heartbeats: 0 },
  { hour: '13 hours', heartbeats: 0 },
  { hour: '14 hours', heartbeats: 100 },
  { hour: '15 hours', heartbeats: 0 },
  { hour: '16 hours', heartbeats: 0 },
  { hour: '17 hours', heartbeats: 0 },
  { hour: '18 hours', heartbeats: 0 },
  { hour: '19 hours', heartbeats: 0 },
  { hour: '20 hours', heartbeats: 0 },
  { hour: '21 hours', heartbeats: 0 },
  { hour: '22 hours', heartbeats: 0 },
  { hour: '23 hours', heartbeats: 0 },
  { hour: '24 hours', heartbeats: 0 },
]

export const getBarPath = (x: number, y: number, width: number, height: number, value: number, hour: string) => {
  const CONTAINER_RADIUS = 8

  // Extract the number from the hour string
  const hourNumber = parseInt(hour?.split(' ')[0] || '0', 10)

  // Find first and last active hours
  const firstActiveHour = parseInt(chartData.find(d => d.heartbeats > 0)?.hour?.split(' ')[0] || '0', 10)
  const lastActiveHour = parseInt([...chartData].reverse().find(d => d.heartbeats > 0)?.hour?.split(' ')[0] || '0', 10)

  if (value === 0) return ''

  let leftRadius = 0
  let rightRadius = 0

  // Apply left radius only to first active bar
  if (hourNumber === firstActiveHour) leftRadius = CONTAINER_RADIUS

  // Apply right radius only if it's the last hour in the container
  if (hourNumber === lastActiveHour && lastActiveHour === 24) rightRadius = CONTAINER_RADIUS

  // Even larger overlap to ensure absolutely no gaps
  const adjustedWidth = width + 4
  const adjustedX = x - 2

  // Ensure the height covers the full container
  const adjustedY = y - 0.5
  const adjustedHeight = height + 1
  return `
    M ${adjustedX + leftRadius},${adjustedY}
    H ${adjustedX + adjustedWidth - rightRadius}
    ${rightRadius ? `A ${rightRadius} ${rightRadius} 0 0 1 ${adjustedX + adjustedWidth} ${adjustedY + rightRadius}` : ''}
    V ${adjustedY + adjustedHeight - rightRadius}
    ${rightRadius ? `A ${rightRadius} ${rightRadius} 0 0 1 ${adjustedX + adjustedWidth - rightRadius} ${adjustedY + adjustedHeight}` : ''}
    H ${adjustedX + leftRadius}
    ${leftRadius ? `A ${leftRadius} ${leftRadius} 0 0 1 ${adjustedX} ${adjustedY + adjustedHeight - leftRadius}` : ''}
    V ${adjustedY + leftRadius}
    ${leftRadius ? `A ${leftRadius} ${leftRadius} 0 0 1 ${adjustedX + leftRadius} ${adjustedY}` : ''}
    Z
  `
}
