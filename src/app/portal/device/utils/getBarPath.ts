export const _chartData = [
  {
      "hour": "2025-02-11 21:00:00+00",
      "heartbeats": 100
  },
  {
      "hour": "2025-02-11 22:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-11 23:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 00:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 01:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 02:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 03:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 04:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 05:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 06:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 07:00:00+00",
      "heartbeats": 100
  },
  {
      "hour": "2025-02-12 08:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 09:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 10:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 11:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 12:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 13:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 14:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 15:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 16:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 17:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 18:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 19:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 20:00:00+00",
      "heartbeats": 0
  },
  {
      "hour": "2025-02-12 21:00:00+00",
      "heartbeats": 100
  }
]





// export const getBarPath = (x: number, y: number, width: number, height: number, value: number, hour: string, chart_data: any) => {
//   const CONTAINER_RADIUS = 11
//   const chartData = _chartData as { heartbeats: number, hour: string }[]
//   
//   // Extract the number from the hour string
//   const hourNumber = parseInt(hour)
//   

//   // Find first and last active hours
//   const firstActiveHour = parseInt(chartData.find((d:
//   { heartbeats: number }
//   ) => d.heartbeats > 0)?.hour)
//   const lastActiveHour = parseInt([...chartData].reverse().find(d => d.heartbeats > 0)?.hour)

//   if (value === 0) return ''

//   let leftRadius = 0
//   let rightRadius = 0

//   // Apply left radius only to first active bar
//   if (hourNumber === firstActiveHour) leftRadius = CONTAINER_RADIUS

//   // Apply right radius only if it's the last hour in the container
//   if (hourNumber === lastActiveHour && lastActiveHour === 24) rightRadius = CONTAINER_RADIUS

//   // Even larger overlap to ensure absolutely no gaps
  // const adjustedWidth = width + 4
  // const adjustedX = x - 2

  // // Ensure the height covers the full container
  // const adjustedY = y - 0.5
  // const adjustedHeight = height + 1
  // return `
  //   M ${adjustedX + leftRadius},${adjustedY}
  //   H ${adjustedX + adjustedWidth - rightRadius}
  //   ${rightRadius ? `A ${rightRadius} ${rightRadius} 0 0 1 ${adjustedX + adjustedWidth} ${adjustedY + rightRadius}` : ''}
  //   V ${adjustedY + adjustedHeight - rightRadius}
  //   ${rightRadius ? `A ${rightRadius} ${rightRadius} 0 0 1 ${adjustedX + adjustedWidth - rightRadius} ${adjustedY + adjustedHeight}` : ''}
  //   H ${adjustedX + leftRadius}
  //   ${leftRadius ? `A ${leftRadius} ${leftRadius} 0 0 1 ${adjustedX} ${adjustedY + adjustedHeight - leftRadius}` : ''}
  //   V ${adjustedY + leftRadius}
  //   ${leftRadius ? `A ${leftRadius} ${leftRadius} 0 0 1 ${adjustedX + leftRadius} ${adjustedY}` : ''}
  //   Z
  // `
// }

export const getBarPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  value: number,
  hour: string,
  chart_data: any
) => {
  const CONTAINER_RADIUS = 11;
  const chartData = _chartData as { heartbeats: number; hour: string }[];

  // Extract the hour as a number
  const hourNumber = hour;

  

  // Find first and last active hours
  const activeData = chartData.filter((d) => d.heartbeats > 0);
  const firstActiveHour = activeData.length > 0 ? new Date(activeData[0].hour).getUTCHours() : null;
  
  const lastActiveHour = activeData.length > 0 ? new Date(activeData[activeData.length - 1].hour).getUTCHours() : null;
  

  if (value === 0) return '';

  let leftRadius = 0;
  let rightRadius = 0;

  // Apply left radius only to first active bar
  if (hourNumber === firstActiveHour) leftRadius = CONTAINER_RADIUS;

  // Apply right radius only to last active bar
  if (hourNumber === lastActiveHour) rightRadius = CONTAINER_RADIUS;

  // Ensure no gaps
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
};


