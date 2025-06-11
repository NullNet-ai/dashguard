export const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'High Bandwidth': return 'rgba(255, 0, 255, 0.7)'
    case 'Low Bandwidth': return 'rgba(255, 165, 0, 0.7)'
    case 'Medium Bandwidth': return 'rgba(255, 255, 0, 0.7)'
    default: return 'rgba(128, 128, 128, 0.7)'
  }
}