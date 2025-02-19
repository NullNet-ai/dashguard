export const valueExtractor = <T>(path = '', data: Record<string, any>) => {
  const destructure_path = path.split('.')
  const value = destructure_path.reduce(
    (acc, curr) => acc?.[curr] ?? null, data,
  )
  return value as T
}
