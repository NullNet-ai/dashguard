export const getTrafficColor = (trafficLevel: number) => {
  if (trafficLevel > 8000) return 'rgba(255, 0, 0, 0.7)'; // High traffic
  if (trafficLevel > 2000) return 'rgba(255, 165, 0, 0.7)'; // Medium traffic
  return 'rgba(0, 128, 0, 0.7)'; // Low traffic
};