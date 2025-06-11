export const formatBandwidth = (bandwidth: string) => {
  const bw = parseInt(bandwidth);
  return `${(bw / 1000)} KB/s`;
};
