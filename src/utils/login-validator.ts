export const handleLoginError = (response: any) => {
  const { statusCode } = response ?? {}
  const isSuccess = !statusCode || (statusCode >= 200 && statusCode < 300)

  if (isSuccess) {
    return null
  }

  return JSON.parse(JSON.stringify(response))
}
