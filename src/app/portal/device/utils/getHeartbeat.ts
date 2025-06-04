export const getLastSecondsTimeStamp = (seconds: number) => {
  const now = new Date()

  const last_seconds = new Date(now)
  last_seconds.setSeconds(now.getSeconds() - seconds)

  const replace = (_date: Date) => _date.toISOString().replace('T', ' ')
    .substring(0, 19) + '+00'

  const formatted_now = replace(now)
  const formatted_ast = replace(last_seconds)

  const result = [formatted_ast, formatted_now]

  return result
}


export const getLastMinutesTimeStamp = (minutes: number) => {
  const now = new Date()

  const last_minutes = new Date(now)
  last_minutes.setMinutes(now.getMinutes() - minutes)

  const replace = (_date: Date) => _date.toISOString().replace('T', ' ')
    .substring(0, 19) + '+00'

  const formatted_now = replace(now)
  const formatted_ast = replace(last_minutes)

  const result = [formatted_ast, formatted_now]

  
  return result
}
