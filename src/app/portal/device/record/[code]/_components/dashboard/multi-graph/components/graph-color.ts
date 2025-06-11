export  const graphColors: any = {
    'vtnet0': '#8EBAD9',
    'vtnet1': '#f97316',
  }

export  const sortInterface = (interfaces: any[]) => {
  return [...interfaces].sort((a, b) => (a.value === 'vtnet1' ? -1 : b.value === 'vtnet1' ? 1 : 0));
}
  