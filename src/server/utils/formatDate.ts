export const formatDate = (date: Date) => {
  const givenDate = date || new Date()
  const locale = 'en-CA'
  const timezone = process.env.TIMEZONE || 'Asia/Manila'
  const options: any = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }
  const resolvedDate = givenDate.toLocaleDateString(locale, options)
  const resolvedTime = convertTime12to24(
      givenDate.toLocaleTimeString(locale, {
        timeZone: timezone,
      }),
    )

  return {
    date: resolvedDate,
    time: resolvedTime,
    dataTime: `${resolvedDate} ${resolvedTime}`,
  }
}

export const convertTime12to24 = (time12h: string) => {
  const [time = '', modifier] = time12h.split(' ')
  let hours = time.split(':')[0] || '0'
  const minutes = time.split(':')[1] || '0'

  if (hours === '12' && modifier === 'AM') {
    hours = '0'
  }

  if (modifier === 'PM' && hours !== '12') {
    hours = `${parseInt(hours, 10) + 12}`
  }

  const formatted_hours = hours.toString().padStart(2, '0')
  const formatted_minutes = minutes.toString().padStart(2, '0')

  return `${formatted_hours}:${formatted_minutes}`
}
