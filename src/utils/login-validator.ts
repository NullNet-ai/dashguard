export const handleLoginError = (response: any) => {
  const statusCode = response?.statusCode || response?.status_code
  const isSuccess = response?.success || (statusCode && (statusCode >= 200 && statusCode < 300))

  if (isSuccess) {
    return null
  }

  return JSON.parse(JSON.stringify(response))
}
