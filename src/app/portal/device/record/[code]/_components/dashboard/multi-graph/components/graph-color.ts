export  const graphColors: Record<string, string> = {
    'vtnet0': '#8EBAD9',
    'vtnet1': '#f97316',
    'em0': '#8EBAD9',
    'em1': '#f97316',
    'wan': '#8EBAD9',
    'lan': '#f97316',
  }

// Extended palette that complements the predefined colors above
const extraPalette = [
  '#4ade80', // green
  '#a855f7', // purple
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#eab308', // yellow
  '#6366f1', // indigo
  '#ec4899', // pink
  '#84cc16', // lime
  '#0ea5e9', // sky
  '#f97316', // amber (distinct shade)
];

const assignedColors = new Map<string, string>(Object.entries(graphColors));

export const getInterfaceColor = (interfaceName: string, interfaceDevice: string): string => {
  if (assignedColors.has(interfaceName)) {
    return assignedColors.get(interfaceName)!;
  } else if (assignedColors.has(interfaceDevice)) {
    return assignedColors.get(interfaceDevice)!;
  }
  const usedColors = new Set(assignedColors.values());
  const next = extraPalette.find((c) => !usedColors.has(c));
  const color = next ?? `hsl(${(assignedColors.size * 67) % 360}, 65%, 55%)`;
  assignedColors.set(interfaceName, color);
  return color;
};

export  const sortInterface = (interfaces: any[]) => {
  return [...interfaces].sort((a, b) => (a.value === 'vtnet1' ? -1 : b.value === 'vtnet1' ? 1 : 0));
}
  